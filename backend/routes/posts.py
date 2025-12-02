from fastapi import APIRouter, HTTPException, Query, Depends
from bson import ObjectId
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from db import get_posts_collection
from models import Post
from auth import get_current_user

router = APIRouter(prefix="/posts", tags=["posts"])

# Request models
class CreatePostRequest(BaseModel):
    item_title: str 
    description: Optional[str] = ""
    images: List[str] = []
    category: Optional[str] = "Other"
    condition: str = "Used"
    location: str

class UpdatePostRequest(BaseModel):
    item_title: Optional[str] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    location: Optional[str] = None


def post_to_response(post_doc) -> Post:
    """Convert MongoDB post document into response model"""
    return Post(
        id=str(post_doc["_id"]),
        item_title=post_doc["item_title"],
        description=post_doc.get("description"),
        owner_id=post_doc["owner_id"],
        created_at=post_doc["created_at"],
        images=post_doc.get("images", []),
        category=post_doc.get("category"),
        condition=post_doc["condition"],
        location=post_doc["location"],
        claimed_by=post_doc.get("claimed_by"),
        status=post_doc["status"]
    )


@router.get("", response_model=List[Post])
async def get_all_posts(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    """Get all posts with optional filters"""
    posts = get_posts_collection()
    
    query = {}
    if category and category != "All":
        query["category"] = category
    if status:
        query["status"] = status
    
    cursor = posts.find(query).sort("created_at", -1)
    posts_list = await cursor.to_list(length=None)
    
    return [post_to_response(post) for post in posts_list]


@router.post("", response_model=Post, status_code=201)
async def create_post(
    post: CreatePostRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a new post (requires authentication)"""
    posts = get_posts_collection()

    # Debug log to verify frontend request body
    print("📩 Received create post request:", post.dict())
    print("📩 Authenticated user:", current_user["id"])

    post_doc = {
        "item_title": post.item_title,
        "description": post.description,
        "owner_id": current_user["id"],  # Use authenticated user ID
        "created_at": datetime.utcnow(),
        "images": post.images if post.images else [],
        "category": post.category,
        "condition": post.condition,
        "location": post.location,
        "claimed_by": None,
        "status": "available"
    }

    result = await posts.insert_one(post_doc)
    post_doc["_id"] = result.inserted_id

    return post_to_response(post_doc)


@router.get("/{post_id}", response_model=Post)
async def get_post(post_id: str):
    """Get a single post by ID"""
    posts = get_posts_collection()
    
    try:
        post = await posts.find_one({"_id": ObjectId(post_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return post_to_response(post)


@router.post("/{post_id}/claim", response_model=Post)
async def claim_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Claim a post (requires authentication)"""
    posts = get_posts_collection()
    
    try:
        post = await posts.find_one({"_id": ObjectId(post_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Prevent users from claiming their own posts
    if post["owner_id"] == current_user["id"]:
        raise HTTPException(status_code=400, detail="You cannot claim your own post")
    
    if post["status"] == "claimed":
        raise HTTPException(status_code=400, detail="Post already claimed")
    
    result = await posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": {"claimed_by": current_user["id"], "status": "claimed"}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to claim post")
    
    updated_post = await posts.find_one({"_id": ObjectId(post_id)})
    return post_to_response(updated_post)


@router.put("/{post_id}", response_model=Post)
async def update_post(
    post_id: str,
    update_data: UpdatePostRequest,
    current_user: dict = Depends(get_current_user)
):
    """Update a post (requires authentication, only owner can edit)"""
    posts = get_posts_collection()
    
    try:
        post = await posts.find_one({"_id": ObjectId(post_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Only the owner can edit their post
    if post["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only edit your own posts")
    
    # Cannot edit claimed posts
    if post["status"] == "claimed":
        raise HTTPException(status_code=400, detail="Cannot edit a claimed post")
    
    # Build update dictionary with only provided fields
    update_fields = {}
    if update_data.item_title is not None:
        update_fields["item_title"] = update_data.item_title
    if update_data.description is not None:
        update_fields["description"] = update_data.description
    if update_data.images is not None:
        update_fields["images"] = update_data.images
    if update_data.category is not None:
        update_fields["category"] = update_data.category
    if update_data.condition is not None:
        update_fields["condition"] = update_data.condition
    if update_data.location is not None:
        update_fields["location"] = update_data.location
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    result = await posts.update_one(
        {"_id": ObjectId(post_id)},
        {"$set": update_fields}
    )
    
    updated_post = await posts.find_one({"_id": ObjectId(post_id)})
    return post_to_response(updated_post)


@router.post("/{post_id}/pickup", status_code=200)
async def confirm_pickup(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Confirm item pickup and delete the post (requires authentication).
    Can be confirmed by either the poster (owner) or the claimer.
    """
    posts = get_posts_collection()
    
    try:
        post = await posts.find_one({"_id": ObjectId(post_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Only claimed posts can be marked as picked up
    if post["status"] != "claimed":
        raise HTTPException(status_code=400, detail="Only claimed items can be marked as picked up")
    
    # Only the poster or claimer can confirm pickup
    if current_user["id"] != post["owner_id"] and current_user["id"] != post.get("claimed_by"):
        raise HTTPException(status_code=403, detail="Only the poster or claimer can confirm pickup")
    
    # Delete the post
    result = await posts.delete_one({"_id": ObjectId(post_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Failed to delete post")
    
    return {"message": "Item picked up successfully", "post_id": post_id}


@router.delete("/{post_id}", status_code=204)
async def delete_post(
    post_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a post (requires authentication, only owner can delete)"""
    posts = get_posts_collection()
    
    try:
        post = await posts.find_one({"_id": ObjectId(post_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Only the owner can delete their post
    if post["owner_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only delete your own posts")
    
    result = await posts.delete_one({"_id": ObjectId(post_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=500, detail="Failed to delete post")
    
    return None
