"""
Chat Schemas
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class ChatMessageBase(BaseModel):
    auction_id: UUID
    message: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessage(ChatMessageBase):
    id: UUID
    user_id: Optional[UUID] = None
    user_name: Optional[str] = None
    is_admin_message: bool
    created_at: datetime

    class Config:
        from_attributes = True
