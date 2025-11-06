from fastapi import FastAPI
from contextlib import asynccontextmanager
from db import connect_db, close_db, database

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()

app = FastAPI(lifespan=lifespan)

@app.get("/")
def read_root():
    return {"message": "GoodFinds API is running!"}

@app.get("/health")
async def health_check():
    try:
        await database.command("ping")
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "error": str(e)}