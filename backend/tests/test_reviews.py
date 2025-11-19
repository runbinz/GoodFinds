import pytest
from httpx import AsyncClient
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock
from bson import ObjectId


class TestReviews:
    
    @pytest.mark.asyncio
    async def test_create_review_success(self, client: AsyncClient, mock_db, mock_auth):
        """
        Test successful review creation after claiming item
        """
        post_id = str(ObjectId())
        poster_id = "user_poster123"
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Free Couch",
            "owner_id": poster_id,
            "claimed_by": mock_auth["id"],
            "status": "claimed",
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        mock_db.posts.find_one = AsyncMock(return_value=mock_post)
        mock_db.reviews.find_one = AsyncMock(return_value=None)
        
        mock_insert_result = MagicMock()
        mock_insert_result.inserted_id = ObjectId()
        mock_db.reviews.insert_one = AsyncMock(return_value=mock_insert_result)
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list = AsyncMock(return_value=[])
        mock_db.reviews.find = MagicMock(return_value=mock_cursor)
        
        mock_db.users.update_one = AsyncMock()
        
        review_data = {
            "poster_id": poster_id,
            "post_id": post_id,
            "rating": 5.0,
            "comment": "Great experience!"
        }
        
        response = await client.post("/reviews", json=review_data)
        
        assert response.status_code == 201
        assert response.json()["rating"] == 5.0
        assert response.json()["reviewer_id"] == mock_auth["id"]
    
    
    @pytest.mark.asyncio
    async def test_create_review_not_claimed(self, client: AsyncClient, mock_db, mock_auth):
        """
        Test review creation fails if user didn't claim the item
        """
        post_id = str(ObjectId())
        
        mock_post = {
            "_id": ObjectId(post_id),
            "owner_id": "user_poster123",
            "claimed_by": "user_someone_else",
            "status": "claimed",
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        mock_db.posts.find_one = AsyncMock(return_value=mock_post)
        
        review_data = {
            "poster_id": "user_poster123",
            "post_id": post_id,
            "rating": 5.0,
            "comment": "Test"
        }
        
        response = await client.post("/reviews", json=review_data)
        
        assert response.status_code == 403
        assert "only review items you claimed" in response.json()["detail"].lower()
    
    
    @pytest.mark.asyncio
    async def test_create_review_duplicate(self, client: AsyncClient, mock_db, mock_auth):
        """
        Test cannot create duplicate review for same post
        """
        post_id = str(ObjectId())
        poster_id = "user_poster123"
        
        mock_post = {
            "_id": ObjectId(post_id),
            "owner_id": poster_id,
            "claimed_by": mock_auth["id"],
            "status": "claimed",
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        existing_review = {
            "_id": ObjectId(),
            "reviewer_id": mock_auth["id"],
            "post_id": post_id,
            "rating": 4.0
        }
        
        mock_db.posts.find_one = AsyncMock(return_value=mock_post)
        mock_db.reviews.find_one = AsyncMock(return_value=existing_review)
        
        review_data = {
            "poster_id": poster_id,
            "post_id": post_id,
            "rating": 5.0,
            "comment": "Another review"
        }
        
        response = await client.post("/reviews", json=review_data)
        
        assert response.status_code == 400
        assert "already reviewed" in response.json()["detail"].lower()
    
    
    @pytest.mark.asyncio
    async def test_get_poster_reviews(self, client: AsyncClient, mock_db):
        """
        Test getting all reviews for a poster
        """
        poster_id = "user_poster123"
        
        mock_reviews = [
            {
                "_id": ObjectId(),
                "reviewer_id": "user_1",
                "poster_id": poster_id,
                "post_id": str(ObjectId()),
                "rating": 5.0,
                "comment": "Great!",
                "created_at": datetime.utcnow()
            },
            {
                "_id": ObjectId(),
                "reviewer_id": "user_2",
                "poster_id": poster_id,
                "post_id": str(ObjectId()),
                "rating": 4.0,
                "comment": "Good",
                "created_at": datetime.utcnow()
            }
        ]
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list = AsyncMock(return_value=mock_reviews)
        mock_cursor.limit = MagicMock(return_value=mock_cursor)
        mock_cursor.sort = MagicMock(return_value=mock_cursor)
        mock_db.reviews.find = MagicMock(return_value=mock_cursor)
        
        response = await client.get(f"/reviews/poster/{poster_id}")
        
        assert response.status_code == 200
        assert len(response.json()) == 2

