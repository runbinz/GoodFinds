import pytest
from httpx import AsyncClient
from datetime import datetime
from unittest.mock import AsyncMock, MagicMock
from bson import ObjectId


class TestUseCase3Search:
    
    @pytest.mark.asyncio
    async def test_category_selection(self, client: AsyncClient, mock_db):
        """
        Test Case: Category Selection
        Technique: Equivalence Partitioning
        Expected: Only items in "Electronics" category are displayed
        """
        electronics_post1 = {
            "_id": ObjectId(),
            "item_title": "Laptop",
            "description": "Dell laptop",
            "owner_id": "user_123",
            "created_at": datetime.utcnow(),
            "images": ["laptop.jpg"],
            "category": "Electronics",
            "condition": "used",
            "location": "Boston",
            "claimed_by": None,
            "status": "available"
        }
        
        electronics_post2 = {
            "_id": ObjectId(),
            "item_title": "Mouse",
            "description": "Wireless mouse",
            "owner_id": "user_456",
            "created_at": datetime.utcnow(),
            "images": ["mouse.jpg"],
            "category": "Electronics",
            "condition": "new",
            "location": "Cambridge",
            "claimed_by": None,
            "status": "available"
        }
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list = AsyncMock(return_value=[electronics_post1, electronics_post2])
        
        mock_find = MagicMock(return_value=mock_cursor)
        mock_cursor.limit = MagicMock(return_value=mock_cursor)
        mock_cursor.sort = MagicMock(return_value=mock_cursor)
        mock_db.posts.find = mock_find
        
        response = await client.get("/posts?category=Electronics")
        
        assert response.status_code == 200
        posts = response.json()
        assert len(posts) == 2
        assert all(post["category"] == "Electronics" for post in posts)
        
        called_query = mock_find.call_args[0][0]
        assert called_query["category"] == "Electronics"
    
    
    @pytest.mark.asyncio
    async def test_search_by_location(self, client: AsyncClient, mock_db):
        """
        Additional test: Search by location
        """
        boston_post = {
            "_id": ObjectId(),
            "item_title": "Couch",
            "owner_id": "user_123",
            "created_at": datetime.utcnow(),
            "images": [],
            "category": "furniture",
            "condition": "used",
            "location": "Boston",
            "claimed_by": None,
            "status": "available"
        }
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list = AsyncMock(return_value=[boston_post])
        mock_cursor.limit = MagicMock(return_value=mock_cursor)
        mock_cursor.sort = MagicMock(return_value=mock_cursor)
        mock_db.posts.find = MagicMock(return_value=mock_cursor)
        
        response = await client.get("/posts?location=Boston")
        
        assert response.status_code == 200
        posts = response.json()
        assert len(posts) == 1
        assert "Boston" in posts[0]["location"]
    
    
    @pytest.mark.asyncio
    async def test_search_by_status(self, client: AsyncClient, mock_db):
        """
        Additional test: Search by status (available items)
        """
        available_posts = [
            {
                "_id": ObjectId(),
                "item_title": f"Item {i}",
                "owner_id": "user_123",
                "created_at": datetime.utcnow(),
                "images": [],
                "category": "misc",
                "condition": "used",
                "location": "Boston",
                "claimed_by": None,
                "status": "available"
            }
            for i in range(3)
        ]
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list = AsyncMock(return_value=available_posts)
        mock_cursor.limit = MagicMock(return_value=mock_cursor)
        mock_cursor.sort = MagicMock(return_value=mock_cursor)
        mock_db.posts.find = MagicMock(return_value=mock_cursor)
        
        response = await client.get("/posts?status=available")
        
        assert response.status_code == 200
        posts = response.json()
        assert len(posts) == 3
        assert all(post["status"] == "available" for post in posts)
    
    
    @pytest.mark.asyncio
    async def test_search_by_condition(self, client: AsyncClient, mock_db):
        """
        Additional test: Search by condition
        """
        new_item = {
            "_id": ObjectId(),
            "item_title": "Brand New Item",
            "owner_id": "user_123",
            "created_at": datetime.utcnow(),
            "images": [],
            "category": "misc",
            "condition": "new",
            "location": "Boston",
            "claimed_by": None,
            "status": "available"
        }
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list = AsyncMock(return_value=[new_item])
        mock_cursor.limit = MagicMock(return_value=mock_cursor)
        mock_cursor.sort = MagicMock(return_value=mock_cursor)
        mock_db.posts.find = MagicMock(return_value=mock_cursor)
        
        response = await client.get("/posts?condition=new")
        
        assert response.status_code == 200
        posts = response.json()
        assert len(posts) == 1
        assert posts[0]["condition"] == "new"
    
    
    @pytest.mark.asyncio
    async def test_search_multiple_filters(self, client: AsyncClient, mock_db):
        """
        Additional test: Search with multiple filters
        """
        filtered_post = {
            "_id": ObjectId(),
            "item_title": "Gaming Laptop",
            "owner_id": "user_123",
            "created_at": datetime.utcnow(),
            "images": [],
            "category": "Electronics",
            "condition": "used",
            "location": "Boston",
            "claimed_by": None,
            "status": "available"
        }
        
        mock_cursor = AsyncMock()
        mock_cursor.to_list = AsyncMock(return_value=[filtered_post])
        mock_cursor.limit = MagicMock(return_value=mock_cursor)
        mock_cursor.sort = MagicMock(return_value=mock_cursor)
        mock_db.posts.find = MagicMock(return_value=mock_cursor)
        
        response = await client.get("/posts?category=Electronics&condition=used&location=Boston")
        
        assert response.status_code == 200
        posts = response.json()
        assert len(posts) == 1
    
    
    @pytest.mark.asyncio
    async def test_search_no_results(self, client: AsyncClient, mock_db):
        """
        Additional test: Search with no matching results
        """
        mock_cursor = AsyncMock()
        mock_cursor.to_list = AsyncMock(return_value=[])
        mock_cursor.limit = MagicMock(return_value=mock_cursor)
        mock_cursor.sort = MagicMock(return_value=mock_cursor)
        mock_db.posts.find = MagicMock(return_value=mock_cursor)
        
        response = await client.get("/posts?category=NonexistentCategory")
        
        assert response.status_code == 200
        assert response.json() == []
    
    
    @pytest.mark.asyncio
    async def test_get_specific_post(self, client: AsyncClient, mock_db):
        """
        Additional test: Get specific post by ID
        """
        post_id = ObjectId()
        mock_post = {
            "_id": post_id,
            "item_title": "Specific Item",
            "owner_id": "user_123",
            "created_at": datetime.utcnow(),
            "images": ["item.jpg"],
            "category": "misc",
            "condition": "used",
            "location": "Boston",
            "claimed_by": None,
            "status": "available"
        }
        
        mock_db.posts.find_one = AsyncMock(return_value=mock_post)
        
        response = await client.get(f"/posts/{str(post_id)}")
        
        assert response.status_code == 200
        assert response.json()["item_title"] == "Specific Item"

