"""
Helper utility functions for the backend.
"""
from models import Post, Review, User


def post_doc_to_model(post_doc: dict) -> Post:
    """
    Convert MongoDB document to Post model.
    MongoDB uses '_id', but our model uses 'id'.
    """
    return Post(
        id=str(post_doc["_id"]),
        item_title=post_doc["item_title"],
        description=post_doc.get("description"),
        owner_id=post_doc["owner_id"],
        created_at=post_doc["created_at"],
        images=post_doc.get("images", []),
        category=post_doc.get("category"),
        condition=post_doc["condition"],
        location=post_doc["location"],
        claimed_by=post_doc.get("claimed_by"),
        status=post_doc["status"]
    )


def review_doc_to_model(review_doc: dict) -> Review:
    """Convert MongoDB document to Review model"""
    return Review(
        id=str(review_doc["_id"]),
        reviewer_id=review_doc["reviewer_id"],
        poster_id=review_doc["poster_id"],
        post_id=review_doc["post_id"],
        rating=review_doc["rating"],
        comment=review_doc.get("comment"),
        created_at=review_doc["created_at"]
    )


def user_doc_to_model(user_doc: dict) -> User:
    """Convert MongoDB document to User model"""
    return User(
        id=str(user_doc["_id"]),
        username=user_doc.get("username", ""),
        email=user_doc.get("email", ""),
        reputation=user_doc.get("reputation", 0.0),
        review_count=user_doc.get("review_count", 0)
    )

