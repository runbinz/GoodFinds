import pytest
from httpx import AsyncClient
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock
from bson import ObjectId
from pydantic import ValidationError
from models import CreatePostRequest


class TestUseCase1UploadItemListing:
    
    @pytest.mark.asyncio
    async def test_exceeding_photo_upload_limit(self, client: AsyncClient, mock_db, mock_auth):
        """
        Test Case: Exceeding Photo Upload Limit
        Technique: Boundary Value Analysis
        Expected: Prevents adding 10th photo by displaying error message
        """
        post_data = {
            "item_title": "Test Item",
            "description": "Test description",
            "condition": "new",
            "location": "Boston",
            "category": "electronics",
            "images": [
                "image1.jpg", "image2.jpg", "image3.jpg", "image4.jpg", "image5.jpg",
                "image6.jpg", "image7.jpg", "image8.jpg", "image9.jpg", "image10.jpg"
            ]
        }
        
        response = await client.post("/posts", json=post_data)
        
        assert response.status_code == 422
        assert "images" in response.json()["detail"][0]["loc"]
        error_msg = response.json()["detail"][0]["msg"].lower()
        assert "9" in error_msg or "10" in error_msg
    
    
    @pytest.mark.asyncio
    async def test_missing_photo_requirement(self, client: AsyncClient, mock_db, mock_auth):
        """
        Test Case: Missing Photo Requirement
        Technique: Boundary Value Analysis
        Expected: Accepts post with 0 photos (photos are optional in requirements)
        """
        post_data = {
            "item_title": "Test Item",
            "description": "Test description",
            "condition": "new",
            "location": "Boston",
            "category": "electronics",
            "images": []
        }
        
        mock_insert_result = MagicMock()
        mock_insert_result.inserted_id = ObjectId()
        mock_db.posts.insert_one = AsyncMock(return_value=mock_insert_result)
        
        response = await client.post("/posts", json=post_data)
        
        assert response.status_code == 201
        assert response.json()["images"] == []
    
    
    @pytest.mark.asyncio
    async def test_successful_upload(self, client: AsyncClient, mock_db, mock_auth):
        """
        Test Case: Successful Upload
        Technique: Equivalence Partitioning
        Expected: System validates and uploads post
        """
        post_data = {
            "item_title": "Free Couch",
            "description": "Comfortable blue couch",
            "condition": "used",
            "location": "Boston",
            "category": "furniture",
            "images": ["couch1.jpg", "couch2.png"]
        }
        
        mock_insert_result = MagicMock()
        mock_insert_result.inserted_id = ObjectId()
        mock_db.posts.insert_one = AsyncMock(return_value=mock_insert_result)
        
        response = await client.post("/posts", json=post_data)
        
        assert response.status_code == 201
        assert response.json()["item_title"] == "Free Couch"
        assert response.json()["owner_id"] == mock_auth["id"]
        assert response.json()["status"] == "available"
        mock_db.posts.insert_one.assert_called_once()
    
    
    @pytest.mark.asyncio
    async def test_valid_photo_format(self, client: AsyncClient, mock_db, mock_auth):
        """
        Test Case: Valid Photo Format
        Technique: Equivalence Partitioning
        Expected: System accepts both PNG and JPG files
        """
        post_data = {
            "item_title": "Test Item",
            "description": "Test",
            "condition": "new",
            "location": "Boston",
            "category": "electronics",
            "images": ["photo1.png", "photo2.jpg", "photo3.jpeg"]
        }
        
        mock_insert_result = MagicMock()
        mock_insert_result.inserted_id = ObjectId()
        mock_db.posts.insert_one = AsyncMock(return_value=mock_insert_result)
        
        response = await client.post("/posts", json=post_data)
        
        assert response.status_code == 201
        assert len(response.json()["images"]) == 3
    
    
    @pytest.mark.asyncio
    async def test_invalid_photo_format(self, client: AsyncClient, mock_db, mock_auth):
        """
        Test Case: Invalid Photo Format
        Technique: Equivalence Partitioning
        Expected: System rejects files and displays error message
        """
        post_data = {
            "item_title": "Test Item",
            "description": "Test",
            "condition": "new",
            "location": "Boston",
            "category": "electronics",
            "images": ["document.pdf", "file.docx"]
        }
        
        response = await client.post("/posts", json=post_data)
        
        assert response.status_code == 422
        assert "images" in response.json()["detail"][0]["loc"]
    
    
    @pytest.mark.asyncio
    async def test_max_title_length(self, client: AsyncClient, mock_db, mock_auth):
        """
        Test Case: Max Title Length
        Technique: Boundary Value Analysis
        Expected: Error message for title > 100 characters
        """
        long_title = "A" * 101
        
        post_data = {
            "item_title": long_title,
            "description": "Test",
            "condition": "new",
            "location": "Boston",
            "images": []
        }
        
        response = await client.post("/posts", json=post_data)
        
        assert response.status_code == 422
        assert "item_title" in response.json()["detail"][0]["loc"]
    
    
    @pytest.mark.asyncio
    async def test_min_title_length(self, client: AsyncClient, mock_db, mock_auth):
        """
        Test Case: Min Title Length
        Technique: Boundary Value Analysis
        Expected: Error message for empty title
        """
        post_data = {
            "item_title": "",
            "description": "Test",
            "condition": "new",
            "location": "Boston",
            "images": []
        }
        
        response = await client.post("/posts", json=post_data)
        
        assert response.status_code == 422
        assert "item_title" in response.json()["detail"][0]["loc"]
    
    
    @pytest.mark.asyncio
    async def test_title_edge_case_whitespace(self, client: AsyncClient, mock_db, mock_auth):
        """
        Additional test: Title with only whitespace
        """
        post_data = {
            "item_title": "   ",
            "description": "Test",
            "condition": "new",
            "location": "Boston",
            "images": []
        }
        
        response = await client.post("/posts", json=post_data)
        
        assert response.status_code == 422
