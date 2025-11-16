from fastapi import APIRouter

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.get("/")
async def list_reviews():
    return {"msg": "reviews route ok"}
