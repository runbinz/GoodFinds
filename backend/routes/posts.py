from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from db import get_posts_collection
from models import Post

router = APIRouter(prefix="/posts", tags=["posts"])

class CreatePostRequest(BaseModel):
    user_id: str
    item_title: str 
    description: Optional[str] = None
    images: List[str] = []
    category: Optional[str] = None
    condition: str
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

@router.post("", response_model=Post, status_code=201)
async def create_post(post: CreatePostRequest):
    posts_collection = get_posts_collection()
    post_doc = {
        "item_title": post.item_title,
        "description": post.description,
        "owner_id": post.user_id,
        "created_at": datetime.utcnow(),
        "images": post.images,
        "category": post.category,
        "condition": post.condition,
        "location": post.location,
        "claimed_by": None,
        "status": "available"
    }
    result = await posts_collection.insert_one(post_doc)
    created_post = await posts_collection.find_one({"_id": result.inserted_id})
    return post_to_response(created_post)

@router.get("", response_model=List[Post])
async def get_all_posts():
    try:
        posts_collection = get_posts_collection()
        cursor = posts_collection.find({})
        posts = []
        async for post_doc in cursor:
            posts.append(post_to_response(post_doc))
        return posts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
