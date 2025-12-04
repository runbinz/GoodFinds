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
    
    mock_posts_collection = MagicMock()
    mock_reviews_collection = MagicMock()
    mock_users_collection = MagicMock()
    
    mock_database.posts = mock_posts_collection
    mock_database.reviews = mock_reviews_collection
    mock_database.users = mock_users_collection
    
    # Patch the collection getter functions used by routes to return our mocks
    with patch.object(db, 'database', mock_database), \
         patch('db.get_posts_collection', return_value=mock_posts_collection), \
         patch('db.get_reviews_collection', return_value=mock_reviews_collection), \
         patch('db.get_users_collection', return_value=mock_users_collection):
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
