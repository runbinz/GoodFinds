"""
Test cases for utility functions.
"""
import pytest
from datetime import datetime
from bson import ObjectId
from utils import post_doc_to_model, review_doc_to_model, user_doc_to_model


class TestUtilityFunctions:
    
    def test_post_doc_to_model_complete(self):
        """Test converting a complete post document to model"""
        post_doc = {
            "_id": ObjectId(),
            "item_title": "Test Item",
            "description": "Test description",
            "owner_id": "user_123",
            "created_at": datetime.utcnow(),
            "images": ["image1.jpg", "image2.png"],
            "category": "Electronics",
            "condition": "new",
            "location": "Boston",
            "claimed_by": "user_456",
            "status": "claimed"
        }
        
        post_model = post_doc_to_model(post_doc)
        
        assert post_model.id == str(post_doc["_id"])
        assert post_model.item_title == "Test Item"
        assert post_model.description == "Test description"
        assert post_model.owner_id == "user_123"
        assert post_model.images == ["image1.jpg", "image2.png"]
        assert post_model.category == "Electronics"
        assert post_model.condition == "new"
        assert post_model.location == "Boston"
        assert post_model.claimed_by == "user_456"
        assert post_model.status == "claimed"
    
    
    def test_post_doc_to_model_minimal(self):
        """Test converting a minimal post document with optional fields missing"""
        post_doc = {
            "_id": ObjectId(),
            "item_title": "Minimal Item",
            "owner_id": "user_789",
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Cambridge",
            "status": "available"
        }
        
        post_model = post_doc_to_model(post_doc)
        
        assert post_model.id == str(post_doc["_id"])
        assert post_model.item_title == "Minimal Item"
        assert post_model.description is None
        assert post_model.images == []
        assert post_model.category is None
        assert post_model.claimed_by is None
    
    
    def test_post_doc_to_model_no_images(self):
        """Test converting post document with empty images array"""
        post_doc = {
            "_id": ObjectId(),
            "item_title": "No Images Item",
            "owner_id": "user_123",
            "created_at": datetime.utcnow(),
            "condition": "used",
            "location": "Boston",
            "status": "available"
        }
        
        post_model = post_doc_to_model(post_doc)
        
        assert post_model.images == []
    
    
    def test_review_doc_to_model_complete(self):
        """Test converting a complete review document to model"""
        review_doc = {
            "_id": ObjectId(),
            "reviewer_id": "user_reviewer",
            "poster_id": "user_poster",
            "post_id": "post_123",
            "rating": 4.5,
            "comment": "Great experience!",
            "created_at": datetime.utcnow()
        }
        
        review_model = review_doc_to_model(review_doc)
        
        assert review_model.id == str(review_doc["_id"])
        assert review_model.reviewer_id == "user_reviewer"
        assert review_model.poster_id == "user_poster"
        assert review_model.post_id == "post_123"
        assert review_model.rating == 4.5
        assert review_model.comment == "Great experience!"
    
    
    def test_review_doc_to_model_no_comment(self):
        """Test converting review document without optional comment"""
        review_doc = {
            "_id": ObjectId(),
            "reviewer_id": "user_reviewer",
            "poster_id": "user_poster",
            "post_id": "post_123",
            "rating": 3.0,
            "created_at": datetime.utcnow()
        }
        
        review_model = review_doc_to_model(review_doc)
        
        assert review_model.id == str(review_doc["_id"])
        assert review_model.rating == 3.0
        assert review_model.comment is None
    
    
    def test_review_doc_to_model_rating_boundaries(self):
        """Test converting review documents with boundary ratings"""
        # Min rating
        review_doc_min = {
            "_id": ObjectId(),
            "reviewer_id": "user_1",
            "poster_id": "user_2",
            "post_id": "post_1",
            "rating": 1.0,
            "created_at": datetime.utcnow()
        }
        
        review_min = review_doc_to_model(review_doc_min)
        assert review_min.rating == 1.0
        
        # Max rating
        review_doc_max = {
            "_id": ObjectId(),
            "reviewer_id": "user_1",
            "poster_id": "user_2",
            "post_id": "post_1",
            "rating": 5.0,
            "created_at": datetime.utcnow()
        }
        
        review_max = review_doc_to_model(review_doc_max)
        assert review_max.rating == 5.0
    
    
    def test_user_doc_to_model_complete(self):
        """Test converting a complete user document to model"""
        user_doc = {
            "_id": "user_123",
            "username": "testuser",
            "email": "test@example.com",
            "reputation": 4.7,
            "review_count": 15
        }
        
        user_model = user_doc_to_model(user_doc)
        
        assert user_model.id == "user_123"
        assert user_model.username == "testuser"
        assert user_model.email == "test@example.com"
        assert user_model.reputation == 4.7
        assert user_model.review_count == 15
    
    
    def test_user_doc_to_model_minimal(self):
        """Test converting user document with missing optional fields"""
        user_doc = {
            "_id": "user_456"
        }
        
        user_model = user_doc_to_model(user_doc)
        
        assert user_model.id == "user_456"
        assert user_model.username == ""
        assert user_model.email == ""
        assert user_model.reputation == 0.0
        assert user_model.review_count == 0
    
    
    def test_user_doc_to_model_new_user(self):
        """Test converting user document for a new user with no reviews"""
        user_doc = {
            "_id": "new_user",
            "username": "newbie",
            "email": "new@example.com"
        }
        
        user_model = user_doc_to_model(user_doc)
        
        assert user_model.id == "new_user"
        assert user_model.reputation == 0.0
        assert user_model.review_count == 0
    
    
    def test_user_doc_to_model_perfect_reputation(self):
        """Test converting user document with perfect 5.0 reputation"""
        user_doc = {
            "_id": "perfect_user",
            "username": "perfectuser",
            "email": "perfect@example.com",
            "reputation": 5.0,
            "review_count": 20
        }
        
        user_model = user_doc_to_model(user_doc)
        
        assert user_model.reputation == 5.0
        assert user_model.review_count == 20
    
    
    def test_user_doc_to_model_low_reputation(self):
        """Test converting user document with low reputation"""
        user_doc = {
            "_id": "low_user",
            "username": "lowuser",
            "email": "low@example.com",
            "reputation": 1.5,
            "review_count": 3
        }
        
        user_model = user_doc_to_model(user_doc)
        
        assert user_model.reputation == 1.5
        assert user_model.review_count == 3
    
    
    def test_multiple_posts_conversion(self):
        """Test converting multiple post documents"""
        posts = [
            {
                "_id": ObjectId(),
                "item_title": f"Item {i}",
                "owner_id": f"user_{i}",
                "created_at": datetime.utcnow(),
                "condition": "used",
                "location": "Boston",
                "status": "available"
            }
            for i in range(5)
        ]
        
        post_models = [post_doc_to_model(post) for post in posts]
        
        assert len(post_models) == 5
        for i, model in enumerate(post_models):
            assert model.item_title == f"Item {i}"
            assert model.owner_id == f"user_{i}"
    
    
    def test_objectid_string_conversion(self):
        """Test that ObjectId is properly converted to string"""
        object_id = ObjectId()
        
        post_doc = {
            "_id": object_id,
            "item_title": "Test",
            "owner_id": "user_1",
            "created_at": datetime.utcnow(),
            "condition": "new",
            "location": "Boston",
            "status": "available"
        }
        
        post_model = post_doc_to_model(post_doc)
        
        # Verify the ID is a string and matches the ObjectId
        assert isinstance(post_model.id, str)
        assert post_model.id == str(object_id)

