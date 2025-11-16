from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(dotenv_path=ENV_PATH)

print(">>> Forced ENV_PATH =", ENV_PATH)
print(">>> MONGODB_URL =", os.getenv("MONGODB_URL"))
import db 
from routes.auth_routes import router as auth_router
from routes.users import router as users_router
from routes.posts import router as posts_router
from routes.reviews import router as reviews_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Connecting DB…")
    await db.connect_db()
    yield
    print("Closing DB…")
    await db.close_db()


app = FastAPI(lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(posts_router)
app.include_router(reviews_router)

@app.get("/health")
async def health():
    try:
        await db.database.command("ping")
        return {"status": "ok"}
    except Exception as e:
        return {"status": "fail", "error": str(e)}
