from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from db import get_reviews_collection

router = APIRouter(prefix="/reviews", tags=["reviews"])

class ReviewCreate(BaseModel):
    reviewer_id: str
    reviewed_user_id: str
    item_id: str
    rating: int
    comment: str

@router.post("", status_code=201)
async def create_review(review: ReviewCreate):
    reviews_collection = get_reviews_collection()

    if review.rating < 1 or review.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    review_doc = {
        "reviewer_id": review.reviewer_id,
        "reviewed_user_id": review.reviewed_user_id,
        "item_id": review.item_id,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": datetime.utcnow()
    }

    result = await reviews_collection.insert_one(review_doc)
    return {"message": "Review created", "id": str(result.inserted_id)}
