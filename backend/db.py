from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

db_client = None
database = None

async def connect_db():
    global db_client, database

    print(">>> USING MONGODB_URL =", os.getenv("MONGODB_URL"))

    db_client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    database = db_client["goodfinds"]
    print("Connected to MongoDB!")


async def close_db():
    global db_client
    if db_client:
        db_client.close()
        print("Disconnected from MongoDB")

def get_users_collection():
    if database is None:
        raise Exception("Database is not initialized.")
    return database["users"]

def get_posts_collection():
    if database is None:
        raise Exception("Database is not initialized.")
    return database["posts"]

def get_reviews_collection():
    if database is None:
        raise Exception("Database is not initialized.")
    return database["reviews"]
