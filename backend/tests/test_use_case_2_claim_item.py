import pytest
from httpx import AsyncClient
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock
from bson import ObjectId


class TestUseCase2ClaimItem:
    
    @pytest.mark.asyncio
    async def test_claim_available_item(self, client: AsyncClient, mock_db, mock_auth):
        """
        Test Case: Claim Item
        Technique: Equivalence Partitioning
        Expected: Item is marked as claimed and confirmation message appears
        """
        post_id = str(ObjectId())
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Free Couch",
            "description": "Blue couch",
            "owner_id": "user_different123",
            "created_at": datetime.utcnow(),
            "images": ["couch.jpg"],
            "category": "furniture",
            "condition": "used",
            "location": "Boston",
            "claimed_by": None,
            "status": "available"
        }
        
        updated_post = mock_post.copy()
        updated_post["claimed_by"] = mock_auth["id"]
        updated_post["status"] = "claimed"
        
        mock_db.posts.find_one = AsyncMock(return_value=mock_post)
        mock_db.posts.find_one_and_update = AsyncMock(return_value=updated_post)
        
        response = await client.patch(f"/posts/{post_id}/claim", json={})
        
        assert response.status_code == 200
        assert response.json()["status"] == "claimed"
        assert response.json()["claimed_by"] == mock_auth["id"]
        mock_db.posts.find_one_and_update.assert_called_once()
    
    
    @pytest.mark.asyncio
    async def test_claim_already_claimed_item(self, client: AsyncClient, mock_db, mock_auth):
        """
        Test Case: Claim a Claimed Item
        Technique: Equivalence Partitioning
        Expected: Error message that says item already claimed
        """
        post_id = str(ObjectId())
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Free Couch",
            "description": "Blue couch",
            "owner_id": "user_different123",
            "created_at": datetime.utcnow(),
            "images": ["couch.jpg"],
            "category": "furniture",
            "condition": "used",
            "location": "Boston",
            "claimed_by": "user_someone_else",
            "status": "claimed"
        }
        
        mock_db.posts.find_one = AsyncMock(return_value=mock_post)
        
        response = await client.patch(f"/posts/{post_id}/claim", json={})
        
        assert response.status_code == 400
        assert "not available" in response.json()["detail"].lower()
    
    
    @pytest.mark.asyncio
    async def test_claim_own_post(self, client: AsyncClient, mock_db, mock_auth):
        """
        Additional test: User cannot claim their own post
        """
        post_id = str(ObjectId())
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Free Couch",
            "owner_id": mock_auth["id"],
            "status": "available",
            "claimed_by": None,
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        mock_db.posts.find_one = AsyncMock(return_value=mock_post)
        
        response = await client.patch(f"/posts/{post_id}/claim", json={})
        
        assert response.status_code == 400
        assert "own post" in response.json()["detail"].lower()
    
    
    @pytest.mark.asyncio
    async def test_claim_nonexistent_post(self, client: AsyncClient, mock_db, mock_auth):
        """
        Additional test: Claim post that doesn't exist
        """
        post_id = str(ObjectId())
        
        mock_db.posts.find_one = AsyncMock(return_value=None)
        
        response = await client.patch(f"/posts/{post_id}/claim", json={})
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    
    @pytest.mark.asyncio
    async def test_claim_invalid_post_id(self, client: AsyncClient, mock_db, mock_auth):
        """
        Additional test: Claim with invalid ObjectId format
        """
        response = await client.patch("/posts/invalid_id/claim", json={})
        
        assert response.status_code == 400
        assert "invalid" in response.json()["detail"].lower()

