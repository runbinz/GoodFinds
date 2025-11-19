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


@router.get("/{user_id}/posts")
async def get_user_posts(user_id: str):
    """
    Get all posts created by a user.
    
    TODO: Implement if needed for your use cases
    """
    raise HTTPException(status_code=501, detail="Get user posts not implemented yet")


@router.get("/{user_id}/claimed")
async def get_user_claimed_items(user_id: str):
    """
    Get all items claimed by a user.
    Useful for "claimed item history" mentioned in Use Case 3.
    
    TODO: Implement if needed for your use cases
    """
    raise HTTPException(status_code=501, detail="Get claimed items not implemented yet")
