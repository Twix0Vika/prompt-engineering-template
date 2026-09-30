import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, status

from .models import CapsuleCreate, CapsuleInDb, CapsuleResponse, CapsuleUpdate


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _compute_status(capsule: CapsuleInDb) -> str:
    target = capsule.target_datetime
    # Normalize to UTC-aware
    if target.tzinfo is None:
        target = target.replace(tzinfo=timezone.utc)
    if _now() < target:
        return "locked"
    if capsule.is_opened:
        return "opened"
    return "ready"


def _apply_sealing(capsule: CapsuleInDb) -> CapsuleResponse:
    """
    NFR-1: If Current_Time < Target_DateTime the API MUST NOT expose
    `text` or `media_files`.  Those fields are replaced with safe empty values.
    """
    status_str = _compute_status(capsule)
    is_locked = status_str == "locked"

    return CapsuleResponse(
        id=capsule.id,
        title=capsule.title,
        target_datetime=capsule.target_datetime,
        notify_email=capsule.notify_email,
        status=status_str,
        text=None if is_locked else capsule.text,
        media_files=[] if is_locked else capsule.media_files,
    )


class CapsuleService:
    def __init__(self, repository):
        self.repository = repository

    # ------------------------------------------------------------------ #
    # Read                                                                 #
    # ------------------------------------------------------------------ #
    def list_capsules(self, owner_id: str) -> list[CapsuleResponse]:
        capsules = self.repository.get_all_by_user(owner_id)
        return [_apply_sealing(c) for c in capsules]

    def get_capsule(self, capsule_id: str, owner_id: str) -> CapsuleResponse:
        capsule = self._get_owned_or_404(capsule_id, owner_id)
        return _apply_sealing(capsule)

    # ------------------------------------------------------------------ #
    # Create                                                               #
    # ------------------------------------------------------------------ #
    def create_capsule(
        self,
        data: CapsuleCreate,
        owner_id: str,
        saved_media: list[str],
    ) -> CapsuleResponse:
        target = data.target_datetime
        if target.tzinfo is None:
            target = target.replace(tzinfo=timezone.utc)
        if target <= _now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="target_datetime must be in the future",
            )

        capsule = CapsuleInDb(
            id=str(uuid.uuid4()),
            title=data.title,
            target_datetime=target,
            text=data.text,
            media_files=saved_media,
            notify_email=data.notify_email,
            owner_id=owner_id,
            created_at=_now(),
            is_opened=False,
            email_sent=False,
        )
        self.repository.add(capsule)
        return _apply_sealing(capsule)

    # ------------------------------------------------------------------ #
    # Update                                                               #
    # ------------------------------------------------------------------ #
    def update_capsule(
        self,
        capsule_id: str,
        data: CapsuleUpdate,
        owner_id: str,
        saved_media: list[str],
    ) -> CapsuleResponse:
        capsule = self._get_owned_or_404(capsule_id, owner_id)

        # FR-2.2 / FR-2.4 — block edits after unlock
        if _compute_status(capsule) != "locked":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Cannot edit a capsule after its unlock date",
            )

        target = data.target_datetime
        if target.tzinfo is None:
            target = target.replace(tzinfo=timezone.utc)
        if target <= _now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="target_datetime must be in the future",
            )

        capsule.title = data.title
        capsule.target_datetime = target
        capsule.text = data.text
        capsule.notify_email = data.notify_email
        capsule.media_files = saved_media if saved_media else capsule.media_files

        self.repository.update(capsule)
        return _apply_sealing(capsule)

    # ------------------------------------------------------------------ #
    # Delete                                                               #
    # ------------------------------------------------------------------ #
    def delete_capsule(self, capsule_id: str, owner_id: str, media_dir: Path) -> None:
        capsule = self._get_owned_or_404(capsule_id, owner_id)
        # Delete local media files (FR-2.3)
        for filename in capsule.media_files:
            file_path = media_dir / filename
            if file_path.exists():
                file_path.unlink()
        self.repository.delete(capsule_id)

    # ------------------------------------------------------------------ #
    # Mark opened (called by capsule view page)                           #
    # ------------------------------------------------------------------ #
    def mark_opened(self, capsule_id: str, owner_id: str) -> CapsuleResponse:
        capsule = self._get_owned_or_404(capsule_id, owner_id)
        if _compute_status(capsule) != "locked" and not capsule.is_opened:
            capsule.is_opened = True
            self.repository.update(capsule)
        return _apply_sealing(capsule)

    # ------------------------------------------------------------------ #
    # Internal helpers                                                     #
    # ------------------------------------------------------------------ #
    def _get_owned_or_404(self, capsule_id: str, owner_id: str) -> CapsuleInDb:
        capsule = self.repository.get_by_id(capsule_id)
        if capsule is None or capsule.owner_id != owner_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Capsule not found",
            )
        return capsule

