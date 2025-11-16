from fastapi import APIRouter

router = APIRouter(prefix="/posts", tags=["posts"])

@router.get("/")
async def list_posts():
    return {"message": "Posts route working!"}
