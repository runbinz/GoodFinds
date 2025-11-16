from fastapi import APIRouter, HTTPException
import db  
import bcrypt
import jwt
from datetime import datetime, timedelta
import os

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("SECRET_KEY")

@router.post("/register")
async def register(user: dict):
    users = db.get_users_collection()  

    existing = await users.find_one({"email": user["email"]})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = bcrypt.hashpw(user["password"].encode(), bcrypt.gensalt()).decode()

    new_user = {
        "username": user["username"],
        "email": user["email"],
        "password": hashed_pw,
        "reputation": 0.0,
        "reviews": 0
    }

    await users.insert_one(new_user)
    return {"message": "User registered successfully!"}


@router.post("/login")
async def login(user: dict):
    users = db.get_users_collection() 

    found = await users.find_one({"email": user["email"]})
    if not found:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    hashed_pw = found["password"].encode()

    if not bcrypt.checkpw(user["password"].encode(), hashed_pw):
        raise HTTPException(status_code=400, detail="Invalid email or password")

    token = jwt.encode(
        {
            "email": found["email"],
            "exp": datetime.utcnow() + timedelta(hours=24)
        },
        SECRET_KEY,
        algorithm="HS256"
    )

    return {
        "token": token,
        "user": {
            "username": found["username"],
            "email": found["email"]
        }
    }
