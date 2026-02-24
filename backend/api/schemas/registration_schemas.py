"""
Registration Schemas
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

class RegistrationBase(BaseModel):
    auction_id: UUID
    type: str  # 'online' or 'onfield'

class RegistrationCreate(RegistrationBase):
    pass

class Registration(RegistrationBase):
    id: UUID
    user_id: UUID
    status: str
    bidder_number: Optional[str] = None
    registered_at: datetime

    class Config:
        from_attributes = True
