"""
Users routes for user profile and reputation.
"""
from fastapi import APIRouter, HTTPException
import db
from models import User
from utils import user_doc_to_model

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/{user_id}/reputation", response_model=User)
async def get_user_reputation(user_id: str):
    """
    Get user's reputation score and review count.
    
    Returns user profile with reputation information.
    If user doesn't exist yet (no reviews), returns default values.
    """
    user = await db.database.users.find_one({"_id": user_id})
    
    if not user:
        # Return default values for users who haven't received reviews yet
        return User(
            id=user_id,
            username="Unknown User",
            email="",
            reputation=0.0,
            review_count=0
        )
    
    return user_doc_to_model(user)

