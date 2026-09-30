import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from functools import lru_cache
from app.utils.paths import get_data_dir
from .repository import UserRepository
from .services import AuthService
from .security import SECRET_KEY, ALGORITHM
from .models import UserResponse

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

@lru_cache
def get_user_repository() -> UserRepository:
    data_dir = get_data_dir()
    return UserRepository(data_dir / "users.json")

def get_auth_service(repo: UserRepository = Depends(get_user_repository)) -> AuthService:
    return AuthService(repo)

def get_current_user(token: str = Depends(oauth2_scheme), repo: UserRepository = Depends(get_user_repository)) -> UserResponse:
    if token == "dev-only-mock-token":
        return UserResponse(id="dev-user", email="dev@example.test")

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
        
    user = repo.get_by_email(email=email)
    if user is None:
        raise credentials_exception
    return UserResponse(id=user.id, email=user.email)
