"""
Comprehensive test cases for posts endpoints.
"""
import pytest
from httpx import AsyncClient
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock, patch
from bson import ObjectId


class TestPostsCRUD:
    
    @pytest.mark.asyncio
    async def test_get_all_posts_no_filter(self, client: AsyncClient, mock_db):
        """Test getting all posts without filters"""
        mock_posts = [
            {
                "_id": ObjectId(),
                "item_title": "Item 1",
                "description": "Description 1",
                "owner_id": "user_1",
                "created_at": datetime.utcnow(),
                "images": [],
                "category": "Electronics",
                "condition": "new",
                "location": "Boston",
                "claimed_by": None,
                "status": "available"
            },
            {
                "_id": ObjectId(),
                "item_title": "Item 2",
                "description": "Description 2",
                "owner_id": "user_2",
                "created_at": datetime.utcnow(),
                "images": [],
                "category": "Furniture",
                "condition": "used",
                "location": "Cambridge",
                "claimed_by": None,
                "status": "available"
            }
        ]
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list = AsyncMock(return_value=mock_posts)
        mock_cursor.sort = MagicMock(return_value=mock_cursor)
        
        mock_collection = MagicMock()
        mock_collection.find = MagicMock(return_value=mock_cursor)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.get("/posts")
        
        assert response.status_code == 200
        assert len(response.json()) == 2
    
    
    @pytest.mark.asyncio
    async def test_get_single_post_success(self, client: AsyncClient, mock_db):
        """Test getting a single post by valid ID"""
        post_id = ObjectId()
        mock_post = {
            "_id": post_id,
            "item_title": "Test Item",
            "description": "Test description",
            "owner_id": "user_123",
            "created_at": datetime.utcnow(),
            "images": ["image.jpg"],
            "category": "Electronics",
            "condition": "new",
            "location": "Boston",
            "claimed_by": None,
            "status": "available"
        }
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(return_value=mock_post)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.get(f"/posts/{str(post_id)}")
        
        assert response.status_code == 200
        assert response.json()["item_title"] == "Test Item"
    
    
    @pytest.mark.asyncio
    async def test_get_single_post_not_found(self, client: AsyncClient, mock_db):
        """Test getting a post that doesn't exist"""
        post_id = ObjectId()
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(return_value=None)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.get(f"/posts/{str(post_id)}")
        
        assert response.status_code == 404
    
    
    @pytest.mark.asyncio
    async def test_get_single_post_invalid_id(self, client: AsyncClient, mock_db):
        """Test getting a post with invalid ObjectId format"""
        mock_collection = MagicMock()
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.get("/posts/invalid_id_format")
        
        assert response.status_code == 400
    
    
    @pytest.mark.asyncio
    async def test_create_post_success(self, client: AsyncClient, mock_db, mock_auth):
        """Test creating a new post successfully"""
        post_data = {
            "item_title": "New Item",
            "description": "New description",
            "images": ["image1.jpg"],
            "category": "Electronics",
            "condition": "new",
            "location": "Boston"
        }
        
        mock_insert_result = MagicMock()
        mock_insert_result.inserted_id = ObjectId()
        
        mock_collection = MagicMock()
        mock_collection.insert_one = AsyncMock(return_value=mock_insert_result)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.post("/posts", json=post_data)
        
        assert response.status_code == 201
        assert response.json()["item_title"] == "New Item"
        assert response.json()["owner_id"] == mock_auth["id"]
    
    
    @pytest.mark.asyncio
    async def test_update_post_success(self, client: AsyncClient, mock_db, mock_auth):
        """Test successfully updating a post"""
        post_id = str(ObjectId())
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Old Title",
            "description": "Old description",
            "owner_id": mock_auth["id"],
            "status": "available",
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        updated_post = mock_post.copy()
        updated_post["item_title"] = "New Title"
        
        mock_result = MagicMock()
        mock_result.modified_count = 1
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(side_effect=[mock_post, updated_post])
        mock_collection.update_one = AsyncMock(return_value=mock_result)
        
        update_data = {"item_title": "New Title"}
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.put(f"/posts/{post_id}", json=update_data)
        
        assert response.status_code == 200
        assert response.json()["item_title"] == "New Title"
    
    
    @pytest.mark.asyncio
    async def test_update_post_not_owner(self, client: AsyncClient, mock_db, mock_auth):
        """Test that non-owners cannot update posts"""
        post_id = str(ObjectId())
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Item",
            "owner_id": "different_user",
            "status": "available",
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(return_value=mock_post)
        
        update_data = {"item_title": "New Title"}
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.put(f"/posts/{post_id}", json=update_data)
        
        assert response.status_code == 403
    
    
    @pytest.mark.asyncio
    async def test_delete_post_success(self, client: AsyncClient, mock_db, mock_auth):
        """Test successfully deleting a post"""
        post_id = str(ObjectId())
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Item",
            "owner_id": mock_auth["id"],
            "status": "available",
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        mock_result = MagicMock()
        mock_result.deleted_count = 1
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(return_value=mock_post)
        mock_collection.delete_one = AsyncMock(return_value=mock_result)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.delete(f"/posts/{post_id}")
        
        assert response.status_code == 204


class TestPostsClaim:
    
    @pytest.mark.asyncio
    async def test_claim_post_success(self, client: AsyncClient, mock_db, mock_auth):
        """Test successfully claiming an available post"""
        post_id = str(ObjectId())
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Free Item",
            "owner_id": "different_user",
            "status": "available",
            "claimed_by": None,
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        updated_post = mock_post.copy()
        updated_post["claimed_by"] = mock_auth["id"]
        updated_post["status"] = "claimed"
        
        mock_result = MagicMock()
        mock_result.modified_count = 1
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(side_effect=[mock_post, updated_post])
        mock_collection.update_one = AsyncMock(return_value=mock_result)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.post(f"/posts/{post_id}/claim")
        
        assert response.status_code == 200
        assert response.json()["status"] == "claimed"
    
    
    @pytest.mark.asyncio
    async def test_claim_own_post(self, client: AsyncClient, mock_db, mock_auth):
        """Test that users cannot claim their own posts"""
        post_id = str(ObjectId())
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "My Item",
            "owner_id": mock_auth["id"],
            "status": "available",
            "claimed_by": None,
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(return_value=mock_post)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.post(f"/posts/{post_id}/claim")
        
        assert response.status_code == 400


class TestPostsPickup:
    
    @pytest.mark.asyncio
    async def test_confirm_pickup_by_owner(self, client: AsyncClient, mock_db, mock_auth):
        """Test that post owner can confirm pickup"""
        post_id = str(ObjectId())
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Item",
            "owner_id": mock_auth["id"],
            "claimed_by": "claimer_user",
            "status": "claimed",
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        mock_result = MagicMock()
        mock_result.deleted_count = 1
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(return_value=mock_post)
        mock_collection.delete_one = AsyncMock(return_value=mock_result)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.post(f"/posts/{post_id}/pickup")
        
        assert response.status_code == 200
    
    
    @pytest.mark.asyncio
    async def test_confirm_pickup_by_claimer(self, client: AsyncClient, mock_db, mock_auth):
        """Test that claimer can confirm pickup"""
        post_id = str(ObjectId())
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Item",
            "owner_id": "owner_user",
            "claimed_by": mock_auth["id"],
            "status": "claimed",
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        mock_result = MagicMock()
        mock_result.deleted_count = 1
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(return_value=mock_post)
        mock_collection.delete_one = AsyncMock(return_value=mock_result)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.post(f"/posts/{post_id}/pickup")
        
        assert response.status_code == 200
    
    
    @pytest.mark.asyncio
    async def test_confirm_pickup_not_claimed(self, client: AsyncClient, mock_db, mock_auth):
        """Test that pickup cannot be confirmed for unclaimed items"""
        post_id = str(ObjectId())
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Item",
            "owner_id": mock_auth["id"],
            "claimed_by": None,
            "status": "available",
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(return_value=mock_post)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.post(f"/posts/{post_id}/pickup")
        
        assert response.status_code == 400
    
    
    @pytest.mark.asyncio
    async def test_confirm_pickup_unauthorized(self, client: AsyncClient, mock_db, mock_auth):
        """Test that unauthorized users cannot confirm pickup"""
        post_id = str(ObjectId())
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Item",
            "owner_id": "owner_user",
            "claimed_by": "claimer_user",
            "status": "claimed",
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(return_value=mock_post)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.post(f"/posts/{post_id}/pickup")
        
        assert response.status_code == 403
    
    
    @pytest.mark.asyncio
    async def test_confirm_pickup_not_found(self, client: AsyncClient, mock_db, mock_auth):
        """Test confirming pickup for non-existent post"""
        post_id = str(ObjectId())
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(return_value=None)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.post(f"/posts/{post_id}/pickup")
        
        assert response.status_code == 404


class TestPostsEdgeCases:
    
    @pytest.mark.asyncio
    async def test_get_posts_with_category_filter(self, client: AsyncClient, mock_db):
        """Test getting posts filtered by category"""
        mock_posts = [
            {
                "_id": ObjectId(),
                "item_title": "Laptop",
                "owner_id": "user_1",
                "created_at": datetime.utcnow(),
                "images": [],
                "category": "Electronics",
                "condition": "used",
                "location": "Boston",
                "claimed_by": None,
                "status": "available"
            }
        ]
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list = AsyncMock(return_value=mock_posts)
        mock_cursor.sort = MagicMock(return_value=mock_cursor)
        
        mock_collection = MagicMock()
        mock_collection.find = MagicMock(return_value=mock_cursor)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.get("/posts?category=Electronics")
        
        assert response.status_code == 200
    
    
    @pytest.mark.asyncio
    async def test_get_posts_with_status_filter(self, client: AsyncClient, mock_db):
        """Test getting posts filtered by status"""
        mock_cursor = AsyncMock()
        mock_cursor.to_list = AsyncMock(return_value=[])
        mock_cursor.sort = MagicMock(return_value=mock_cursor)
        
        mock_collection = MagicMock()
        mock_collection.find = MagicMock(return_value=mock_cursor)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.get("/posts?status=available")
        
        assert response.status_code == 200
    
    
    @pytest.mark.asyncio
    async def test_update_post_claimed_status(self, client: AsyncClient, mock_db, mock_auth):
        """Test that claimed posts cannot be updated"""
        post_id = str(ObjectId())
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Item",
            "owner_id": mock_auth["id"],
            "status": "claimed",
            "claimed_by": "someone",
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(return_value=mock_post)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.put(f"/posts/{post_id}", json={"item_title": "New"})
        
        assert response.status_code == 400
    
    
    @pytest.mark.asyncio
    async def test_update_post_no_fields(self, client: AsyncClient, mock_db, mock_auth):
        """Test updating with no fields provided"""
        post_id = str(ObjectId())
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Item",
            "owner_id": mock_auth["id"],
            "status": "available",
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(return_value=mock_post)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.put(f"/posts/{post_id}", json={})
        
        assert response.status_code == 400
    
    
    @pytest.mark.asyncio
    async def test_claim_already_claimed_post(self, client: AsyncClient, mock_db, mock_auth):
        """Test claiming a post that's already claimed"""
        post_id = str(ObjectId())
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Item",
            "owner_id": "other_user",
            "status": "claimed",
            "claimed_by": "another_user",
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(return_value=mock_post)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.post(f"/posts/{post_id}/claim")
        
        assert response.status_code == 400
    
    
    @pytest.mark.asyncio
    async def test_claim_post_not_found(self, client: AsyncClient, mock_db, mock_auth):
        """Test claiming a non-existent post"""
        post_id = str(ObjectId())
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(return_value=None)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.post(f"/posts/{post_id}/claim")
        
        assert response.status_code == 404
    
    
    @pytest.mark.asyncio
    async def test_delete_post_not_owner(self, client: AsyncClient, mock_db, mock_auth):
        """Test deleting a post you don't own"""
        post_id = str(ObjectId())
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Item",
            "owner_id": "different_user",
            "status": "available",
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(return_value=mock_post)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.delete(f"/posts/{post_id}")
        
        assert response.status_code == 403
    
    
    @pytest.mark.asyncio
    async def test_delete_post_not_found(self, client: AsyncClient, mock_db, mock_auth):
        """Test deleting a non-existent post"""
        post_id = str(ObjectId())
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(return_value=None)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.delete(f"/posts/{post_id}")
        
        assert response.status_code == 404
    
    
    @pytest.mark.asyncio
    async def test_delete_post_invalid_id(self, client: AsyncClient, mock_db, mock_auth):
        """Test deleting with invalid post ID"""
        mock_collection = MagicMock()
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.delete("/posts/invalid_id")
        
        assert response.status_code == 400
    
    
    @pytest.mark.asyncio
    async def test_update_post_invalid_id(self, client: AsyncClient, mock_db, mock_auth):
        """Test updating with invalid post ID"""
        mock_collection = MagicMock()
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.put("/posts/invalid_id", json={"item_title": "New"})
        
        assert response.status_code == 400
    
    
    @pytest.mark.asyncio
    async def test_update_post_not_found(self, client: AsyncClient, mock_db, mock_auth):
        """Test updating a non-existent post"""
        post_id = str(ObjectId())
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(return_value=None)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.put(f"/posts/{post_id}", json={"item_title": "New"})
        
        assert response.status_code == 404
    
    
    @pytest.mark.asyncio
    async def test_update_post_all_fields(self, client: AsyncClient, mock_db, mock_auth):
        """Test updating multiple fields at once"""
        post_id = str(ObjectId())
        
        mock_post = {
            "_id": ObjectId(post_id),
            "item_title": "Old",
            "description": "Old desc",
            "owner_id": mock_auth["id"],
            "status": "available",
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "images": []
        }
        
        updated_post = mock_post.copy()
        updated_post["item_title"] = "New"
        updated_post["description"] = "New desc"
        updated_post["condition"] = "new"
        updated_post["location"] = "Cambridge"
        updated_post["category"] = "Electronics"
        updated_post["images"] = ["new.jpg"]
        
        mock_result = MagicMock()
        mock_result.modified_count = 1
        
        mock_collection = MagicMock()
        mock_collection.find_one = AsyncMock(side_effect=[mock_post, updated_post])
        mock_collection.update_one = AsyncMock(return_value=mock_result)
        
        update_data = {
            "item_title": "New",
            "description": "New desc",
            "condition": "new",
            "location": "Cambridge",
            "category": "Electronics",
            "images": ["new.jpg"]
        }
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.put(f"/posts/{post_id}", json=update_data)
        
        assert response.status_code == 200
        assert response.json()["item_title"] == "New"
    
    
    @pytest.mark.asyncio
    async def test_claim_post_invalid_id(self, client: AsyncClient, mock_db, mock_auth):
        """Test claiming with invalid post ID"""
        mock_collection = MagicMock()
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.post("/posts/invalid_id/claim")
        
        assert response.status_code == 400
    
    
    @pytest.mark.asyncio
    async def test_confirm_pickup_invalid_id(self, client: AsyncClient, mock_db, mock_auth):
        """Test confirming pickup with invalid ID"""
        mock_collection = MagicMock()
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.post("/posts/invalid_id/pickup")
        
        assert response.status_code == 400
    
    
    @pytest.mark.asyncio
    async def test_create_post_with_empty_images(self, client: AsyncClient, mock_db, mock_auth):
        """Test creating post with empty images array"""
        post_data = {
            "item_title": "No Images",
            "description": "Test",
            "images": [],
            "category": "Other",
            "condition": "used",
            "location": "Boston"
        }
        
        mock_insert_result = MagicMock()
        mock_insert_result.inserted_id = ObjectId()
        
        mock_collection = MagicMock()
        mock_collection.insert_one = AsyncMock(return_value=mock_insert_result)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.post("/posts", json=post_data)
        
        assert response.status_code == 201
        assert response.json()["images"] == []
    
    
    @pytest.mark.asyncio
    async def test_create_post_with_all_fields(self, client: AsyncClient, mock_db, mock_auth):
        """Test creating post with all possible fields"""
        post_data = {
            "item_title": "Complete Post",
            "description": "Full description",
            "images": ["img1.jpg", "img2.png"],
            "category": "Electronics",
            "condition": "new",
            "location": "Cambridge"
        }
        
        mock_insert_result = MagicMock()
        mock_insert_result.inserted_id = ObjectId()
        
        mock_collection = MagicMock()
        mock_collection.insert_one = AsyncMock(return_value=mock_insert_result)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.post("/posts", json=post_data)
        
        assert response.status_code == 201
        assert response.json()["category"] == "Electronics"
        assert response.json()["description"] == "Full description"
    
    
    @pytest.mark.asyncio
    async def test_get_posts_category_all(self, client: AsyncClient, mock_db):
        """Test that 'All' category returns all posts"""
        mock_cursor = AsyncMock()
        mock_cursor.to_list = AsyncMock(return_value=[])
        mock_cursor.sort = MagicMock(return_value=mock_cursor)
        
        mock_collection = MagicMock()
        mock_collection.find = MagicMock(return_value=mock_cursor)
        
        with patch('routes.posts.get_posts_collection', return_value=mock_collection):
            response = await client.get("/posts?category=All")
        
        assert response.status_code == 200
        # Verify find was called with empty category query
        call_args = mock_collection.find.call_args[0][0]
        assert "category" not in call_args

