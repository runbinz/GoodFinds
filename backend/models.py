from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class User(BaseModel):
    id: str
    username: str
    email: str
    reputation: float
    reviews: int

class Post(BaseModel):
    id: str
    item_title: str
    description: Optional[str] = None
    owner_id: str
    created_at: datetime
    images: List[str]
    category: Optional[str] = None
    condition: str  # e.g., "new", "like new", "used"
    location: str
    claimed_by: Optional[str] = None
    status: str  # e.g., "available", "claimed", "completed"

class Review(BaseModel):
    id: str
    reviewer_id: str
    poster_id: str
    item_id: str
    rating: float
    comment: Optional[str] = None
    created_at: datetime