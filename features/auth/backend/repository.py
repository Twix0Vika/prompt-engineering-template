from pathlib import Path
from typing import Optional
from app.utils.json_store import read_list_file, write_list_file
from .models import UserInDb

class UserRepository:
    def __init__(self, file_path: Path):
        self.file_path = file_path

    def _load(self) -> list[UserInDb]:
        return read_list_file(self.file_path, UserInDb)

    def _save(self, users: list[UserInDb]) -> None:
        write_list_file(self.file_path, users)

    def get_by_email(self, email: str) -> Optional[UserInDb]:
        users = self._load()
        for u in users:
            if u.email == email:
                return u
        return None

    def get_by_id(self, user_id: str) -> Optional[UserInDb]:
        users = self._load()
        for u in users:
            if u.id == user_id:
                return u
        return None

    def add(self, user: UserInDb) -> None:
        users = self._load()
        users.append(user)
        self._save(users)
