"""
Test cases for users endpoints.
"""
import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock


class TestUsersEndpoints:
    
    @pytest.mark.asyncio
    async def test_get_user_reputation_existing_user(self, client: AsyncClient, mock_db):
        """Test getting reputation for an existing user"""
        user_id = "user_123"
        
        mock_user = {
            "_id": user_id,
            "username": "testuser",
            "email": "test@example.com",
            "reputation": 4.5,
            "review_count": 10
        }
        
        mock_db.users.find_one = AsyncMock(return_value=mock_user)
        
        response = await client.get(f"/users/{user_id}/reputation")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert data["reputation"] == 4.5
        assert data["review_count"] == 10
    
    
    @pytest.mark.asyncio
    async def test_get_user_reputation_new_user(self, client: AsyncClient, mock_db):
        """Test getting reputation for a user who doesn't have reviews yet"""
        user_id = "new_user_456"
        
        mock_db.users.find_one = AsyncMock(return_value=None)
        
        response = await client.get(f"/users/{user_id}/reputation")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
        assert data["username"] == "Unknown User"
        assert data["reputation"] == 0.0
        assert data["review_count"] == 0
    
    
    @pytest.mark.asyncio
    async def test_get_user_reputation_perfect_score(self, client: AsyncClient, mock_db):
        """Test getting reputation for a user with perfect 5.0 rating"""
        user_id = "perfect_user"
        
        mock_user = {
            "_id": user_id,
            "username": "perfectuser",
            "email": "perfect@example.com",
            "reputation": 5.0,
            "review_count": 25
        }
        
        mock_db.users.find_one = AsyncMock(return_value=mock_user)
        
        response = await client.get(f"/users/{user_id}/reputation")
        
        assert response.status_code == 200
        data = response.json()
        assert data["reputation"] == 5.0
        assert data["review_count"] == 25
    
    
    @pytest.mark.asyncio
    async def test_get_user_reputation_low_score(self, client: AsyncClient, mock_db):
        """Test getting reputation for a user with low rating"""
        user_id = "low_user"
        
        mock_user = {
            "_id": user_id,
            "username": "lowuser",
            "email": "low@example.com",
            "reputation": 2.1,
            "review_count": 5
        }
        
        mock_db.users.find_one = AsyncMock(return_value=mock_user)
        
        response = await client.get(f"/users/{user_id}/reputation")
        
        assert response.status_code == 200
        data = response.json()
        assert data["reputation"] == 2.1
        assert data["review_count"] == 5
    
    
    @pytest.mark.asyncio
    async def test_get_user_reputation_missing_fields(self, client: AsyncClient, mock_db):
        """Test getting reputation when user document has missing optional fields"""
        user_id = "incomplete_user"
        
        mock_user = {
            "_id": user_id
            # Missing username, email, reputation, review_count
        }
        
        mock_db.users.find_one = AsyncMock(return_value=mock_user)
        
        response = await client.get(f"/users/{user_id}/reputation")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
        assert data["reputation"] == 0.0
        assert data["review_count"] == 0

