import pytest
import asyncio
from httpx import AsyncClient
from unittest.mock import AsyncMock, MagicMock, patch
from main import app
import db
from auth import get_current_user


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def mock_db():
    mock_database = MagicMock()
    
    mock_posts_collection = AsyncMock()
    mock_reviews_collection = AsyncMock()
    mock_users_collection = AsyncMock()
    
    mock_database.posts = mock_posts_collection
    mock_database.reviews = mock_reviews_collection
    mock_database.users = mock_users_collection
    
    with patch.object(db, 'database', mock_database):
        yield mock_database


@pytest.fixture
def mock_auth():
    async def override_get_current_user():
        return {
            "id": "user_test123",
            "email": "test@example.com",
            "username": "testuser"
        }
    
    app.dependency_overrides[get_current_user] = override_get_current_user
    
    yield {
        "id": "user_test123",
        "email": "test@example.com",
        "username": "testuser"
    }
    
    app.dependency_overrides.clear()


@pytest.fixture
async def client(mock_auth, mock_db):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
