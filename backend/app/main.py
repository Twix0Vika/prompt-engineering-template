import sys
import asyncio
from contextlib import asynccontextmanager
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from features.auth.backend.routers import router as auth_router
from features.capsules.backend.routers import router as capsules_router
from features.capsules.backend.tasks.scheduler import run_scheduler
from app.utils.paths import get_data_dir


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the notification scheduler in the background
    task = asyncio.create_task(run_scheduler())
    yield
    task.cancel()


app = FastAPI(title="TimeCapsule Backend", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5174", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded media files as static assets
media_dir = get_data_dir() / "media"
media_dir.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(media_dir)), name="media")

app.include_router(auth_router, prefix="/api")
app.include_router(capsules_router, prefix="/api")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
