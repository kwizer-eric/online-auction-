"""
Bid Schemas
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from decimal import Decimal

class BidBase(BaseModel):
    auction_id: UUID
    amount: Decimal

class BidCreate(BidBase):
    pass

class FloorBidCreate(BidBase):
    bidder_name: str
    bidder_number: Optional[str] = None

class Bid(BidBase):
    id: UUID
    user_id: Optional[UUID] = None
    type: str
    bidder_name: str
    bidder_number: Optional[str] = None
    timestamp: datetime
    is_winning: bool

    class Config:
        from_attributes = True
