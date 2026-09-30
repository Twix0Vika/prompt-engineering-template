from functools import lru_cache

from fastapi import Depends

from app.utils.paths import get_data_dir
from .repository import CapsuleRepository
from .services import CapsuleService


@lru_cache
def get_capsule_repository() -> CapsuleRepository:
    data_dir = get_data_dir()
    return CapsuleRepository(data_dir / "capsules.json")


def get_capsule_service(
    repo: CapsuleRepository = Depends(get_capsule_repository),
) -> CapsuleService:
    return CapsuleService(repository=repo)

