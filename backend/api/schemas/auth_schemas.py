"""
Authentication Schemas
"""

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserBase(BaseModel):
    email: EmailStr
    name: str
    username: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: UUID
    role: str
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[str] = None
