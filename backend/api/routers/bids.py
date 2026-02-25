"""
Bids Router
Handles bid placement and retrieval
"""

from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from database.database import get_db
from database import models
from api.schemas import bid_schemas
from api.dependencies import get_current_user, get_current_admin
from api.websocket_manager import manager

router = APIRouter()

@router.post("/", response_model=bid_schemas.Bid, status_code=status.HTTP_201_CREATED)
async def place_bid(
    bid: bid_schemas.BidCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Place a bid on an auction"""
    # Get auction
    auction = db.query(models.Auction).filter(models.Auction.id == bid.auction_id).first()
    
    if not auction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found"
        )
    
    if auction.status != "live":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Auction is not live"
        )
    
    # Check if bid is higher than current price
    if bid.amount <= auction.current_price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bid must be higher than current price: ${auction.current_price}"
        )
    
    # Create bid
    db_bid = models.Bid(
        auction_id=bid.auction_id,
        user_id=current_user.id,
        amount=bid.amount,
        type="online",
        bidder_name=current_user.name
    )
    
    db.add(db_bid)
    db.commit()
    db.refresh(db_bid)
    
    # Update auction price (trigger handles this, but refresh)
    db.refresh(auction)
    
    # Broadcast bid update via WebSocket
    await manager.broadcast_bid_update(bid.auction_id, {
        "id": str(db_bid.id),
        "auctionId": str(db_bid.auction_id),
        "newPrice": float(db_bid.amount),
        "bidderName": db_bid.bidder_name,
        "type": db_bid.type,
        "timestamp": db_bid.timestamp.isoformat()
    })
    
    return db_bid

@router.post("/floor", response_model=bid_schemas.Bid, status_code=status.HTTP_201_CREATED)
async def place_floor_bid(
    bid: bid_schemas.FloorBidCreate,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Place a floor bid (Admin only)"""
    # Get auction
    auction = db.query(models.Auction).filter(models.Auction.id == bid.auction_id).first()
    
    if not auction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found"
        )
    
    if auction.status != "live":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Auction is not live"
        )
    
    # Check if bid is higher than current price
    if bid.amount <= auction.current_price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Bid must be higher than current price: ${auction.current_price}"
        )
    
    # Create floor bid
    db_bid = models.Bid(
        auction_id=bid.auction_id,
        user_id=None,  # Floor bids may not have user_id
        amount=bid.amount,
        type="floor",
        bidder_name=bid.bidder_name,
        bidder_number=bid.bidder_number
    )
    
    db.add(db_bid)
    db.commit()
    db.refresh(db_bid)
    
    # Refresh auction
    db.refresh(auction)
    
    # Broadcast floor bid update via WebSocket
    await manager.broadcast_bid_update(bid.auction_id, {
        "id": str(db_bid.id),
        "auctionId": str(db_bid.auction_id),
        "newPrice": float(db_bid.amount),
        "bidderName": db_bid.bidder_name,
        "type": db_bid.type,
        "timestamp": db_bid.timestamp.isoformat()
    })
    
    return db_bid

@router.get("/auction/{auction_id}", response_model=List[bid_schemas.Bid])
async def get_auction_bids(
    auction_id: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all bids for an auction"""
    bids = db.query(models.Bid)\
        .filter(models.Bid.auction_id == auction_id)\
        .order_by(models.Bid.timestamp.desc())\
        .offset(skip)\
        .limit(limit)\
        .all()
    
    return bids

@router.websocket("/ws/{auction_id}")
async def websocket_endpoint(websocket: WebSocket, auction_id: str):
    """WebSocket endpoint for real-time bid updates"""
    await manager.connect(websocket, auction_id)
    
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
    except WebSocketDisconnect:
        await manager.disconnect(websocket, auction_id)
