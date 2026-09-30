import shutil
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
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
def create_capsule(
    title: str = Form(...),
    target_datetime: str = Form(...),
    text: Optional[str] = Form(None),
    notify_email: str = Form(...),
    files: List[UploadFile] = File(default=[]),
    current_user: UserResponse = Depends(get_current_user),
    service: CapsuleService = Depends(get_capsule_service),
):
    from datetime import datetime
    try:
        dt = datetime.fromisoformat(target_datetime)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid datetime format")

    saved_media = _save_uploads([f for f in files if f.filename])
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
def update_capsule(
    capsule_id: str,
    title: str = Form(...),
    target_datetime: str = Form(...),
    text: Optional[str] = Form(None),
    notify_email: str = Form(...),
    files: List[UploadFile] = File(default=[]),
    current_user: UserResponse = Depends(get_current_user),
    service: CapsuleService = Depends(get_capsule_service),
):
    from datetime import datetime
    try:
        dt = datetime.fromisoformat(target_datetime)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid datetime format")

    saved_media = _save_uploads([f for f in files if f.filename])
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

