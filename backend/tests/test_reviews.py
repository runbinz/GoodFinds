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
    
    
    @pytest.mark.asyncio
    async def test_get_review_by_id_success(self, client: AsyncClient, mock_db):
        """
        Test getting a specific review by ID
        """
        review_id = ObjectId()
        
        mock_review = {
            "_id": review_id,
            "reviewer_id": "user_1",
            "poster_id": "user_2",
            "post_id": str(ObjectId()),
            "rating": 4.5,
            "comment": "Great item!",
            "created_at": datetime.utcnow()
        }
        
        mock_db.reviews.find_one = AsyncMock(return_value=mock_review)
        
        response = await client.get(f"/reviews/{str(review_id)}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(review_id)
        assert data["rating"] == 4.5
        assert data["comment"] == "Great item!"
    
    
    @pytest.mark.asyncio
    async def test_get_review_by_id_not_found(self, client: AsyncClient, mock_db):
        """
        Test getting a review that doesn't exist
        """
        review_id = ObjectId()
        
        mock_db.reviews.find_one = AsyncMock(return_value=None)
        
        response = await client.get(f"/reviews/{str(review_id)}")
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    
    @pytest.mark.asyncio
    async def test_get_review_by_id_invalid_id(self, client: AsyncClient, mock_db):
        """
        Test getting a review with invalid ObjectId format
        """
        response = await client.get("/reviews/invalid_id")
        
        assert response.status_code == 400
        assert "invalid" in response.json()["detail"].lower()
    
    
    @pytest.mark.asyncio
    async def test_create_review_invalid_post_id(self, client: AsyncClient, mock_db, mock_auth):
        """
        Test creating review with invalid post ID format
        """
        review_data = {
            "poster_id": "user_poster",
            "post_id": "invalid_id",
            "rating": 5.0,
            "comment": "Great!"
        }
        
        response = await client.post("/reviews", json=review_data)
        
        assert response.status_code == 400
        assert "invalid post id" in response.json()["detail"].lower()
    
    
    @pytest.mark.asyncio
    async def test_create_review_post_not_found(self, client: AsyncClient, mock_db, mock_auth):
        """
        Test creating review for non-existent post
        """
        post_id = str(ObjectId())
        
        mock_db.posts.find_one = AsyncMock(return_value=None)
        
        review_data = {
            "poster_id": "user_poster",
            "post_id": post_id,
            "rating": 5.0,
            "comment": "Great!"
        }
        
        response = await client.post("/reviews", json=review_data)
        
        assert response.status_code == 404
        assert "post not found" in response.json()["detail"].lower()
    
    
    @pytest.mark.asyncio
    async def test_create_review_wrong_poster_id(self, client: AsyncClient, mock_db, mock_auth):
        """
        Test creating review with mismatched poster ID
        """
        post_id = str(ObjectId())
        actual_owner = "user_owner123"
        wrong_poster = "user_wrong456"
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Item",
            "owner_id": actual_owner,
            "claimed_by": mock_auth["id"],
            "status": "claimed",
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        mock_db.posts.find_one = AsyncMock(return_value=mock_post)
        
        review_data = {
            "poster_id": wrong_poster,
            "post_id": post_id,
            "rating": 5.0,
            "comment": "Great!"
        }
        
        response = await client.post("/reviews", json=review_data)
        
        assert response.status_code == 400
        assert "does not match post owner" in response.json()["detail"].lower()
    
    
    @pytest.mark.asyncio
    async def test_create_review_rating_boundary_min(self, client: AsyncClient, mock_db, mock_auth):
        """
        Test creating review with minimum rating (1.0)
        """
        post_id = str(ObjectId())
        poster_id = "user_poster123"
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Item",
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
            "rating": 1.0,
            "comment": "Not great"
        }
        
        response = await client.post("/reviews", json=review_data)
        
        assert response.status_code == 201
        assert response.json()["rating"] == 1.0
    
    
    @pytest.mark.asyncio
    async def test_create_review_rating_boundary_max(self, client: AsyncClient, mock_db, mock_auth):
        """
        Test creating review with maximum rating (5.0)
        """
        post_id = str(ObjectId())
        poster_id = "user_poster123"
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Item",
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
            "comment": "Perfect!"
        }
        
        response = await client.post("/reviews", json=review_data)
        
        assert response.status_code == 201
        assert response.json()["rating"] == 5.0
    
    
    @pytest.mark.asyncio
    async def test_create_review_without_comment(self, client: AsyncClient, mock_db, mock_auth):
        """
        Test creating review without optional comment field
        """
        post_id = str(ObjectId())
        poster_id = "user_poster123"
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Item",
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
            "rating": 4.0
        }
        
        response = await client.post("/reviews", json=review_data)
        
        assert response.status_code == 201
        assert response.json()["rating"] == 4.0
    
    
    @pytest.mark.asyncio
    async def test_get_poster_reviews_with_limit(self, client: AsyncClient, mock_db):
        """
        Test getting poster reviews with custom limit
        """
        poster_id = "user_poster123"
        
        mock_reviews = [
            {
                "_id": ObjectId(),
                "reviewer_id": f"user_{i}",
                "poster_id": poster_id,
                "post_id": str(ObjectId()),
                "rating": 5.0,
                "comment": f"Review {i}",
                "created_at": datetime.utcnow()
            }
            for i in range(5)
        ]
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list = AsyncMock(return_value=mock_reviews[:5])
        mock_cursor.limit = MagicMock(return_value=mock_cursor)
        mock_cursor.sort = MagicMock(return_value=mock_cursor)
        mock_db.reviews.find = MagicMock(return_value=mock_cursor)
        
        response = await client.get(f"/reviews/poster/{poster_id}?limit=5")
        
        assert response.status_code == 200
        assert len(response.json()) == 5
    
    
    @pytest.mark.asyncio
    async def test_get_poster_reviews_empty(self, client: AsyncClient, mock_db):
        """
        Test getting reviews for poster with no reviews
        """
        poster_id = "user_no_reviews"
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list = AsyncMock(return_value=[])
        mock_cursor.limit = MagicMock(return_value=mock_cursor)
        mock_cursor.sort = MagicMock(return_value=mock_cursor)
        mock_db.reviews.find = MagicMock(return_value=mock_cursor)
        
        response = await client.get(f"/reviews/poster/{poster_id}")
        
        assert response.status_code == 200
        assert response.json() == []
    
    
    @pytest.mark.asyncio
    async def test_update_poster_reputation_with_reviews(self, client: AsyncClient, mock_db, mock_auth):
        """
        Test that creating a review updates poster reputation correctly
        """
        post_id = str(ObjectId())
        poster_id = "user_poster123"
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Item",
            "owner_id": poster_id,
            "claimed_by": mock_auth["id"],
            "status": "claimed",
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        existing_reviews = [
            {
                "_id": ObjectId(),
                "reviewer_id": "user_1",
                "poster_id": poster_id,
                "post_id": str(ObjectId()),
                "rating": 5.0,
                "created_at": datetime.utcnow()
            },
            {
                "_id": ObjectId(),
                "reviewer_id": "user_2",
                "poster_id": poster_id,
                "post_id": str(ObjectId()),
                "rating": 4.0,
                "created_at": datetime.utcnow()
            }
        ]
        
        mock_db.posts.find_one = AsyncMock(return_value=mock_post)
        mock_db.reviews.find_one = AsyncMock(return_value=None)
        
        mock_insert_result = MagicMock()
        mock_insert_result.inserted_id = ObjectId()
        mock_db.reviews.insert_one = AsyncMock(return_value=mock_insert_result)
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list = AsyncMock(return_value=existing_reviews)
        mock_db.reviews.find = MagicMock(return_value=mock_cursor)
        
        mock_db.users.update_one = AsyncMock()
        
        review_data = {
            "poster_id": poster_id,
            "post_id": post_id,
            "rating": 3.0,
            "comment": "OK"
        }
        
        response = await client.post("/reviews", json=review_data)
        
        assert response.status_code == 201
        # Verify that update_one was called to update reputation
        mock_db.users.update_one.assert_called_once()

