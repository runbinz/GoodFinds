from fastapi import APIRouter, HTTPException, Query
from bson import ObjectId
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import db
from models import Post

# create router
router = APIRouter(prefix="/posts", tags=["posts"])

class CreatePostRequest(BaseModel):
    # Request body for creating a new post
    user_id: str
    item_title: str 
    description: Optional[str] = None
    images: List[str] = []
    category: Optional[str] = None
    condition: str
    location: str

class ClaimPostRequest(BaseModel):
    # Request body for claiming a post
    user_id: str

def post_to_response(post_doc) -> Post:
    # Convert MongoDB document to Pydantic model
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
    ''' Create a new post '''
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

    result = await db.database.posts.insert_one(post_doc)
    post_doc["_id"] = result.inserted_id

    return post_to_response(post_doc)