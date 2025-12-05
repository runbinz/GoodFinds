from pydantic import BaseModel, Field, field_validator
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
    missing_count: int = 0
    missing_reporters: List[str] = []


class Review(BaseModel):
    id: str
    reviewer_id: str
    poster_id: str
    post_id: str
    rating: float = Field(..., ge=1.0, le=5.0)
    comment: Optional[str] = None
    created_at: datetime


class CreatePostRequest(BaseModel):
    item_title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    images: List[str] = Field(default=[], max_length=9)
    category: Optional[str] = None
    condition: str
    location: str

    @field_validator('item_title')
    @classmethod
    def validate_title(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Title cannot be empty')
        if len(v) > 100:
            raise ValueError('Title must be 100 characters or less')
        return v

    @field_validator('images')
    @classmethod
    def validate_images(cls, v):
        if len(v) > 9:
            raise ValueError('Cannot upload more than 9 images')
        
        valid_extensions = ['.jpg', '.jpeg', '.png']
        for img in v:
            if not any(img.lower().endswith(ext) for ext in valid_extensions):
                raise ValueError(f'Invalid image format. Only JPG and PNG files are allowed')
        return v


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
