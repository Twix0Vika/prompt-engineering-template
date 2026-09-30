from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class CapsuleBase(BaseModel):
    title: str
    target_datetime: datetime
    text: Optional[str] = None
    media_files: List[str] = Field(default_factory=list)
    notify_email: str

class CapsuleCreate(CapsuleBase):
    pass

class CapsuleUpdate(CapsuleBase):
    pass

class CapsuleInDb(CapsuleBase):
    id: str
    owner_id: str
    created_at: datetime
    is_opened: bool = False
    email_sent: bool = False

class CapsuleResponse(BaseModel):
    id: str
    title: str
    target_datetime: datetime
    notify_email: str
    status: str
    text: Optional[str] = None
    media_files: List[str] = Field(default_factory=list)
