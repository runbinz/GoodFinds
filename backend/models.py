from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class User(BaseModel):
    id: str
    username: str
    email: str
    reputation: float = 0.0
    review_count: int = 0


class Post(BaseModel):
    id: str
    item_title: str
    description: Optional[str] = None
    owner_id: str
    created_at: datetime
    images: List[str] = []
    category: Optional[str] = None
    condition: str
    location: str
    claimed_by: Optional[str] = None
    status: str


class Review(BaseModel):
    id: str
    reviewer_id: str
    poster_id: str
    post_id: str
    rating: float = Field(..., ge=1.0, le=5.0)
    comment: Optional[str] = None
    created_at: datetime


class CreatePostRequest(BaseModel):
    item_title: str
    description: Optional[str] = None
    images: List[str] = []
    category: Optional[str] = None
    condition: str
    location: str


class UpdatePostRequest(BaseModel):
    item_title: Optional[str] = None
    description: Optional[str] = None
    images: Optional[List[str]] = None
    category: Optional[str] = None
    condition: Optional[str] = None
    location: Optional[str] = None


class ClaimPostRequest(BaseModel):
    pass


class CreateReviewRequest(BaseModel):
    poster_id: str
    post_id: str
    rating: float = Field(..., ge=1.0, le=5.0)
    comment: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    reputation: float
    review_count: int


class MessageResponse(BaseModel):
    message: str
    
    
class ErrorResponse(BaseModel):
    detail: str
