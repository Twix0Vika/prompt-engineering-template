import shutil
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile, status
from fastapi.staticfiles import StaticFiles

from app.utils.paths import get_data_dir
from features.auth.backend.dependencies import get_current_user
from features.auth.backend.models import UserResponse

from .dependencies import get_capsule_service
from .models import CapsuleCreate, CapsuleResponse, CapsuleUpdate
from .services import CapsuleService

router = APIRouter(prefix="/capsules", tags=["capsules"])

MAX_UPLOAD_BYTES = 15 * 1024 * 1024  # 15 MB total


def _get_media_dir() -> Path:
    media_dir = get_data_dir() / "media"
    media_dir.mkdir(parents=True, exist_ok=True)
    return media_dir


def _save_uploads(files: List[UploadFile]) -> list[str]:
    """Persist uploaded files, return list of relative filenames."""
    import uuid as _uuid

    media_dir = _get_media_dir()
    saved: list[str] = []
    total_bytes = 0

    for f in files:
        if not f.filename:
            continue
        content = f.file.read()
        total_bytes += len(content)
        if total_bytes > MAX_UPLOAD_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Total upload size exceeds 15 MB",
            )
        ext = Path(f.filename).suffix
        filename = f"{_uuid.uuid4()}{ext}"
        (media_dir / filename).write_bytes(content)
        saved.append(filename)

    return saved


async def _extract_capsule_payload(request: Request, default_email: str):
    content_type = request.headers.get("content-type", "")
    title = None
    target_datetime_str = None
    text = None
    notify_email = None
    raw_files: list[UploadFile] = []

    if "multipart/form-data" in content_type or "application/x-www-form-urlencoded" in content_type:
        form = await request.form()
        title = form.get("title")
        target_datetime_str = form.get("target_datetime")
        text = form.get("text")
        notify_email = form.get("notify_email")
        for f in form.getlist("files"):
            if isinstance(f, UploadFile) and f.filename:
                raw_files.append(f)
    else:
        try:
            body = await request.json()
            if isinstance(body, dict):
                title = body.get("title")
                target_datetime_str = body.get("target_datetime")
                text = body.get("text")
                notify_email = body.get("notify_email")
        except Exception:
            pass

    if not title or not str(title).strip():
        raise HTTPException(status_code=422, detail="Title is required")
    if not target_datetime_str:
        raise HTTPException(status_code=422, detail="Target unlock date is required")

    from datetime import datetime
    try:
        clean_str = str(target_datetime_str).strip().replace("Z", "+00:00")
        dt = datetime.fromisoformat(clean_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid datetime format")

    final_email = str(notify_email or default_email or "dev@example.test").strip()
    return str(title).strip(), dt, (str(text) if text else None), final_email, raw_files


# ------------------------------------------------------------------ #
# List                                                                #
# ------------------------------------------------------------------ #
@router.get("/", response_model=list[CapsuleResponse])
def list_capsules(
    current_user: UserResponse = Depends(get_current_user),
    service: CapsuleService = Depends(get_capsule_service),
):
    return service.list_capsules(current_user.id)


# ------------------------------------------------------------------ #
# Create                                                              #
# ------------------------------------------------------------------ #
@router.post("/", response_model=CapsuleResponse, status_code=status.HTTP_201_CREATED)
async def create_capsule(
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    service: CapsuleService = Depends(get_capsule_service),
):
    title, dt, text, notify_email, raw_files = await _extract_capsule_payload(request, current_user.email)
    saved_media = _save_uploads(raw_files)
    data = CapsuleCreate(
        title=title,
        target_datetime=dt,
        text=text,
        media_files=saved_media,
        notify_email=notify_email,
    )
    return service.create_capsule(data, current_user.id, saved_media)


# ------------------------------------------------------------------ #
# Get one                                                             #
# ------------------------------------------------------------------ #
@router.get("/{capsule_id}", response_model=CapsuleResponse)
def get_capsule(
    capsule_id: str,
    current_user: UserResponse = Depends(get_current_user),
    service: CapsuleService = Depends(get_capsule_service),
):
    return service.get_capsule(capsule_id, current_user.id)


# ------------------------------------------------------------------ #
# Update                                                              #
# ------------------------------------------------------------------ #
@router.put("/{capsule_id}", response_model=CapsuleResponse)
async def update_capsule(
    capsule_id: str,
    request: Request,
    current_user: UserResponse = Depends(get_current_user),
    service: CapsuleService = Depends(get_capsule_service),
):
    title, dt, text, notify_email, raw_files = await _extract_capsule_payload(request, current_user.email)
    saved_media = _save_uploads(raw_files)
    data = CapsuleUpdate(
        title=title,
        target_datetime=dt,
        text=text,
        media_files=saved_media,
        notify_email=notify_email,
    )
    return service.update_capsule(capsule_id, data, current_user.id, saved_media)


# ------------------------------------------------------------------ #
# Delete                                                              #
# ------------------------------------------------------------------ #
@router.delete("/{capsule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_capsule(
    capsule_id: str,
    current_user: UserResponse = Depends(get_current_user),
    service: CapsuleService = Depends(get_capsule_service),
):
    service.delete_capsule(capsule_id, current_user.id, _get_media_dir())


# ------------------------------------------------------------------ #
# Mark opened                                                         #
# ------------------------------------------------------------------ #
@router.post("/{capsule_id}/open", response_model=CapsuleResponse)
def open_capsule(
    capsule_id: str,
    current_user: UserResponse = Depends(get_current_user),
    service: CapsuleService = Depends(get_capsule_service),
):
    return service.mark_opened(capsule_id, current_user.id)

