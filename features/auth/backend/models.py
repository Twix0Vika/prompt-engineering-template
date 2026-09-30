import uuid
from pydantic import BaseModel, EmailStr, Field

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(min_length=6)

class UserInDb(UserBase):
    id: str
    hashed_password: str

class UserResponse(UserBase):
    id: str

class Token(BaseModel):
    access_token: str
    token_type: str
