import uuid
from typing import Optional
from fastapi import HTTPException, status
from .models import UserCreate, UserInDb, UserResponse
from .repository import UserRepository
from .security import get_password_hash, verify_password

class AuthService:
    def __init__(self, repository: UserRepository):
        self.repository = repository

    def register_user(self, data: UserCreate) -> UserResponse:
        existing = self.repository.get_by_email(data.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        user_id = str(uuid.uuid4())
        hashed_pw = get_password_hash(data.password)
        new_user = UserInDb(id=user_id, email=data.email, hashed_password=hashed_pw)
        self.repository.add(new_user)
        return UserResponse(id=new_user.id, email=new_user.email)

    def authenticate_user(self, email: str, password: str) -> Optional[UserInDb]:
        user = self.repository.get_by_email(email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user
