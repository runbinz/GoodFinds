from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from db import get_users_collection

router = APIRouter(prefix="/users", tags=["users"])

class UserCreate(BaseModel):
    user_id: str
    name: str
    email: str
    phone: Optional[str] = None
    reputation: float = 5.0  # default

@router.post("", status_code=201)
async def create_user(user: UserCreate):
    users_collection = get_users_collection()

    existing = await users_collection.find_one({"user_id": user.user_id})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    user_doc = {
        "user_id": user.user_id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "reputation": user.reputation,
        "created_at": datetime.utcnow()
    }

    result = await users_collection.insert_one(user_doc)
    return {"message": "User created", "id": str(result.inserted_id)}
