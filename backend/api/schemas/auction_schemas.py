"""
Auction Schemas
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal

class AuctionBase(BaseModel):
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    starting_price: Decimal
    auction_date: datetime
    location: Optional[str] = None

class AuctionCreate(AuctionBase):
    pass

class AuctionUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    image_url: Optional[str] = None
    category: Optional[str] = None
    starting_price: Optional[Decimal] = None
    auction_date: Optional[datetime] = None
    location: Optional[str] = None

class Auction(AuctionBase):
    id: UUID
    current_price: Decimal
    status: str
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
