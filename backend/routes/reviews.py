from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from typing import List
from datetime import datetime
import db
from models import Review, CreateReviewRequest
from utils import review_doc_to_model
from auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.post("", response_model=Review, status_code=201)
async def create_review(
    review: CreateReviewRequest,
    current_user: dict = Depends(get_current_user)
):
    if not ObjectId.is_valid(review.post_id):
        raise HTTPException(status_code=400, detail="Invalid post ID")
    
    post = await db.database.posts.find_one({"_id": ObjectId(review.post_id)})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    if post.get("claimed_by") != current_user["id"]:
        raise HTTPException(
            status_code=403,
            detail="You can only review items you claimed"
        )
    
    if post["owner_id"] != review.poster_id:
        raise HTTPException(
            status_code=400,
            detail="Poster ID does not match post owner"
        )
    
    existing_review = await db.database.reviews.find_one({
        "reviewer_id": current_user["id"],
        "post_id": review.post_id
    })
    if existing_review:
        raise HTTPException(
            status_code=400,
            detail="You have already reviewed this post"
        )
    
    review_doc = {
        "reviewer_id": current_user["id"],
        "poster_id": review.poster_id,
        "post_id": review.post_id,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": datetime.utcnow()
    }
    
    result = await db.database.reviews.insert_one(review_doc)
    review_doc["_id"] = result.inserted_id
    
    await update_poster_reputation(review.poster_id)
    
    return review_doc_to_model(review_doc)


@router.get("/{review_id}", response_model=Review)
async def get_review(review_id: str):
    if not ObjectId.is_valid(review_id):
        raise HTTPException(status_code=400, detail="Invalid review ID")
    
    review = await db.database.reviews.find_one({"_id": ObjectId(review_id)})
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    return review_doc_to_model(review)


@router.get("/poster/{poster_id}", response_model=List[Review])
async def get_poster_reviews(poster_id: str, limit: int = 50):
    cursor = db.database.reviews.find({"poster_id": poster_id}).limit(limit).sort("created_at", -1)
    reviews = await cursor.to_list(length=limit)
    
    return [review_doc_to_model(review) for review in reviews]


async def update_poster_reputation(poster_id: str):
    cursor = db.database.reviews.find({"poster_id": poster_id})
    reviews = await cursor.to_list(length=None)
    
    if not reviews:
        avg_rating = 0.0
        review_count = 0
    else:
        total_rating = sum(review["rating"] for review in reviews)
        avg_rating = total_rating / len(reviews)
        review_count = len(reviews)
    
    await db.database.users.update_one(
        {"_id": poster_id},
        {
            "$set": {
                "reputation": round(avg_rating, 2),
                "review_count": review_count
            }
        },
        upsert=True
    )
