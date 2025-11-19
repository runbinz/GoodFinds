"""
GoodFinds API - Main application entry point.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

# Load environment variables
ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=ENV_PATH)

# Import database connection
import db

# Import routers
from routes.posts import router as posts_router
from routes.reviews import router as reviews_router
from routes.users import router as users_router
# Note: auth_routes commented out for now - will be refactored for Clerk later
# from routes.auth_routes import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Starting GoodFinds API...")
    await db.connect_db()
    yield
    print("Shutting down GoodFinds API")
    await db.close_db()


# Create FastAPI application
app = FastAPI(
    title="GoodFinds API",
    description="Backend API for GoodFinds - A platform for giving away unwanted items",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Your Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(posts_router)
app.include_router(reviews_router)
app.include_router(users_router)
# app.include_router(auth_router)  # TODO: Refactor for Clerk, then uncomment


@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "Welcome to GoodFinds API!",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint - verifies database connection"""
    try:
        await db.database.command("ping")
        return {
            "status": "healthy",
            "database": "connected",
            "message": "All systems operational"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }
