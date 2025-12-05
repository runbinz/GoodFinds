"""
Test cases for Pydantic models and validation.
"""
import pytest
from pydantic import ValidationError
from models import CreatePostRequest, UpdatePostRequest, CreateReviewRequest


class TestPostModels:
    
    def test_create_post_valid_data(self):
        """Test creating a post with valid data"""
        post = CreatePostRequest(
            item_title="Test Item",
            description="Description",
            images=["image1.jpg"],
            category="Electronics",
            condition="new",
            location="Boston"
        )
        
        assert post.item_title == "Test Item"
        assert post.condition == "new"
    
    
    def test_create_post_empty_title(self):
        """Test that empty title raises validation error"""
        with pytest.raises(ValidationError) as exc_info:
            CreatePostRequest(
                item_title="",
                condition="new",
                location="Boston"
            )
        
        assert "item_title" in str(exc_info.value)
    
    
    def test_create_post_title_too_long(self):
        """Test that title over 100 chars raises error"""
        with pytest.raises(ValidationError) as exc_info:
            CreatePostRequest(
                item_title="A" * 101,
                condition="new",
                location="Boston"
            )
        
        assert "item_title" in str(exc_info.value)
    
    
    def test_create_post_too_many_images(self):
        """Test that more than 9 images raises error"""
        with pytest.raises(ValidationError) as exc_info:
            CreatePostRequest(
                item_title="Test",
                condition="new",
                location="Boston",
                images=[f"image{i}.jpg" for i in range(10)]
            )
        
        assert "images" in str(exc_info.value)
    
    
    def test_create_post_invalid_image_format(self):
        """Test that invalid image format raises error"""
        with pytest.raises(ValidationError) as exc_info:
            CreatePostRequest(
                item_title="Test",
                condition="new",
                location="Boston",
                images=["document.pdf"]
            )
        
        assert "images" in str(exc_info.value)
    
    
    def test_create_post_valid_image_formats(self):
        """Test that all valid image formats work"""
        post = CreatePostRequest(
            item_title="Test",
            condition="new",
            location="Boston",
            images=["photo.jpg", "pic.jpeg", "img.png"]
        )
        
        assert len(post.images) == 3
    
    
    def test_create_post_whitespace_title(self):
        """Test that whitespace-only title raises error"""
        with pytest.raises(ValidationError) as exc_info:
            CreatePostRequest(
                item_title="   ",
                condition="new",
                location="Boston"
            )
        
        assert "item_title" in str(exc_info.value)
    
    
    def test_update_post_optional_fields(self):
        """Test that update post allows optional fields"""
        update = UpdatePostRequest(
            item_title="New Title"
        )
        
        assert update.item_title == "New Title"
        assert update.description is None
        assert update.images is None


class TestReviewModels:
    
    def test_create_review_valid(self):
        """Test creating a review with valid data"""
        review = CreateReviewRequest(
            poster_id="user_123",
            post_id="post_456",
            rating=4.5,
            comment="Great!"
        )
        
        assert review.rating == 4.5
        assert review.comment == "Great!"
    
    
    def test_create_review_rating_min_boundary(self):
        """Test minimum valid rating (1.0)"""
        review = CreateReviewRequest(
            poster_id="user_123",
            post_id="post_456",
            rating=1.0
        )
        
        assert review.rating == 1.0
    
    
    def test_create_review_rating_max_boundary(self):
        """Test maximum valid rating (5.0)"""
        review = CreateReviewRequest(
            poster_id="user_123",
            post_id="post_456",
            rating=5.0
        )
        
        assert review.rating == 5.0
    
    
    def test_create_review_rating_below_min(self):
        """Test that rating below 1.0 raises error"""
        with pytest.raises(ValidationError) as exc_info:
            CreateReviewRequest(
                poster_id="user_123",
                post_id="post_456",
                rating=0.5
            )
        
        assert "rating" in str(exc_info.value)
    
    
    def test_create_review_rating_above_max(self):
        """Test that rating above 5.0 raises error"""
        with pytest.raises(ValidationError) as exc_info:
            CreateReviewRequest(
                poster_id="user_123",
                post_id="post_456",
                rating=5.5
            )
        
        assert "rating" in str(exc_info.value)
    
    
    def test_create_review_without_comment(self):
        """Test that comment is optional"""
        review = CreateReviewRequest(
            poster_id="user_123",
            post_id="post_456",
            rating=4.0
        )
        
        assert review.comment is None
    
    
    def test_create_review_with_comment(self):
        """Test creating review with comment"""
        review = CreateReviewRequest(
            poster_id="user_123",
            post_id="post_456",
            rating=3.5,
            comment="Good transaction"
        )
        
        assert review.comment == "Good transaction"
        assert review.rating == 3.5


class TestPostModelEdgeCases:
    
    def test_create_post_minimal_data(self):
        """Test creating post with only required fields"""
        post = CreatePostRequest(
            item_title="Minimal",
            condition="used",
            location="Boston"
        )
        
        assert post.item_title == "Minimal"
        assert post.images == []
        assert post.description == "" or post.description is None
    
    
    def test_create_post_exact_title_length(self):
        """Test creating post with exactly 100 character title"""
        title = "A" * 100
        post = CreatePostRequest(
            item_title=title,
            condition="used",
            location="Boston"
        )
        
        assert len(post.item_title) == 100
    
    
    def test_create_post_exactly_nine_images(self):
        """Test creating post with exactly 9 images (max allowed)"""
        images = [f"image{i}.jpg" for i in range(9)]
        post = CreatePostRequest(
            item_title="Test",
            condition="used",
            location="Boston",
            images=images
        )
        
        assert len(post.images) == 9
    
    
    def test_create_post_mixed_case_image_extensions(self):
        """Test that image validation handles mixed case extensions"""
        post = CreatePostRequest(
            item_title="Test",
            condition="used",
            location="Boston",
            images=["photo.JPG", "pic.PNG", "img.JpEg"]
        )
        
        assert len(post.images) == 3

