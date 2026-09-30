from pathlib import Path
from typing import Optional
from app.utils.json_store import read_list_file, write_list_file
from .models import CapsuleInDb

class CapsuleRepository:
    def __init__(self, file_path: Path):
        self.file_path = file_path

    def _load(self) -> list[CapsuleInDb]:
        return read_list_file(self.file_path, CapsuleInDb)

    def _save(self, capsules: list[CapsuleInDb]) -> None:
        write_list_file(self.file_path, capsules)

    def get_all_by_user(self, user_id: str) -> list[CapsuleInDb]:
        capsules = self._load()
        return [c for c in capsules if c.owner_id == user_id]

    def get_by_id(self, capsule_id: str) -> Optional[CapsuleInDb]:
        capsules = self._load()
        for c in capsules:
            if c.id == capsule_id:
                return c
        return None

    def add(self, capsule: CapsuleInDb) -> None:
        capsules = self._load()
        capsules.append(capsule)
        self._save(capsules)

    def update(self, capsule: CapsuleInDb) -> None:
        capsules = self._load()
        for i, c in enumerate(capsules):
            if c.id == capsule.id:
                capsules[i] = capsule
                break
        self._save(capsules)

    def delete(self, capsule_id: str) -> None:
        capsules = self._load()
        capsules = [c for c in capsules if c.id != capsule_id]
        self._save(capsules)
        
    def get_all(self) -> list[CapsuleInDb]:
        return self._load()
