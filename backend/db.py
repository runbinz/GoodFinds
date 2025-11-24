from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import certifi

load_dotenv()

db_client = None
database = None

async def connect_db():
    global db_client, database

    mongodb_url = os.getenv("MONGODB_URL")
    
    if not mongodb_url:
        raise Exception("MONGODB_URL not found in environment variables! Check your .env file.")
    
    print(">>> USING MONGODB_URL =", mongodb_url)

    # Use certifi for SSL certificate verification
    db_client = AsyncIOMotorClient(mongodb_url, tlsCAFile=certifi.where())
    database = db_client["goodfinds"]
    
    # Test the connection
    try:
        await database.command("ping")
        print("✓ Connected to MongoDB successfully!")
    except Exception as e:
        print("✗ Failed to connect to MongoDB:", e)
        raise


async def close_db():
    global db_client
    if db_client:
        db_client.close()
        print("Disconnected from MongoDB")


# Database collection getter methods

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