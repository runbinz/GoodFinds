from fastapi import APIRouter, HTTPException, Query, Depends
from bson import ObjectId
from typing import List, Optional
from datetime import datetime
import db
from models import Post, CreatePostRequest, ClaimPostRequest
from utils import post_doc_to_model
from auth import get_current_user

router = APIRouter(prefix="/posts", tags=["posts"])


@router.post("", response_model=Post, status_code=201)
async def create_post(
    post: CreatePostRequest,
    current_user: dict = Depends(get_current_user)
):
    post_doc = {
        "item_title": post.item_title,
        "description": post.description,
        "owner_id": current_user["id"],
        "created_at": datetime.utcnow(),
        "images": post.images,
        "category": post.category,
        "condition": post.condition,
        "location": post.location,
        "claimed_by": None,
        "status": "available"
    }

    result = await db.database.posts.insert_one(post_doc)
    post_doc["_id"] = result.inserted_id

    return post_doc_to_model(post_doc)


@router.get("", response_model=List[Post])
async def search_posts(
    category: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    condition: Optional[str] = Query(None),
    status: Optional[str] = Query("available"),
    limit: int = Query(50, le=100)
):
    query = {}
    
    if category:
        query["category"] = category
    if location:
        query["location"] = {"$regex": location, "$options": "i"}
    if condition:
        query["condition"] = condition
    if status:
        query["status"] = status
    
    cursor = db.database.posts.find(query).limit(limit).sort("created_at", -1)
    posts = await cursor.to_list(length=limit)
    
    return [post_doc_to_model(post) for post in posts]


@router.get("/{post_id}", response_model=Post)
async def get_post(post_id: str):
    if not ObjectId.is_valid(post_id):
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    post = await db.database.posts.find_one({"_id": ObjectId(post_id)})
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    return post_doc_to_model(post)


@router.patch("/{post_id}/claim", response_model=Post)
async def claim_post(
    post_id: str,
    claim_request: ClaimPostRequest,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(post_id):
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    post = await db.database.posts.find_one({"_id": ObjectId(post_id)})
    
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post["status"] != "available":
        raise HTTPException(status_code=400, detail="Post is not available")
    
    if post["owner_id"] == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot claim your own post")
    
    result = await db.database.posts.find_one_and_update(
        {"_id": ObjectId(post_id)},
        {"$set": {
            "claimed_by": current_user["id"],
            "status": "claimed"
        }},
        return_document=True
    )
    
    return post_doc_to_model(result)
