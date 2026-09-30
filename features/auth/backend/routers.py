from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from .models import UserCreate, UserResponse, Token
from .services import AuthService
from .dependencies import get_auth_service, get_current_user
from .security import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, service: AuthService = Depends(get_auth_service)):
    return service.register_user(data)

@router.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), service: AuthService = Depends(get_auth_service)):
    user = service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return Token(access_token=access_token, token_type="bearer")

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: UserResponse = Depends(get_current_user)):
    return current_user
