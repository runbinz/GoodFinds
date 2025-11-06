from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

db_client = None
database = None

async def connect_db():
    ''' Async initialize MongoDB connection'''
    global db_client, database
    db_client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    database = db_client.goodfinds
    print("Connected to MongoDB!")

async def close_db():
    ''' Async close MongoDB connection '''
    global db_client
    if db_client:
        db_client.close()
        print("Disconnected from MongoDB")