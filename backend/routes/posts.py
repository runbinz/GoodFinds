from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from db import get_posts_collection, get_users_collection
from models import Post

router = APIRouter(prefix="/posts", tags=["posts"])

class CreatePostRequest(BaseModel):
    user_id: str
    item_title: str 
    description: Optional[str] = ""
    images: List[str] = []
    category: Optional[str] = "Other"
    condition: str = "Used"
    location: str

class ClaimPostRequest(BaseModel):
    user_id: str

def post_to_response(post_doc) -> Post:
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
async def create_post(post: CreatePostRequest):
    """Create a new post"""
    posts = get_posts_collection()
    
    post_doc = {
        "item_title": post.item_title,
        "description": post.description,
        "owner_id": post.user_id,
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
async def claim_post(post_id: str, claim: ClaimPostRequest):
    """Claim a post"""
    posts = get_posts_collection()
    
    try:
        post = await posts.find_one({"_id": ObjectId(post_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post["status"] == "claimed":
        raise HTTPException(status_code=400, detail="Post already claimed")
    
    # Update post
    result = await posts.update_one(
        {"_id": ObjectId(post_id)},
        {
            "$set": {
                "claimed_by": claim.user_id,
                "status": "claimed"
            }
        }
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to claim post")
    
    # Get updated post
    updated_post = await posts.find_one({"_id": ObjectId(post_id)})
    return post_to_response(updated_post)

@router.delete("/{post_id}", status_code=204)
async def delete_post(post_id: str):
    """Delete a post"""
    posts = get_posts_collection()
    
    try:
        result = await posts.delete_one({"_id": ObjectId(post_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return None