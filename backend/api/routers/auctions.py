"""
Auctions Router
Handles auction CRUD operations and status management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from database.database import get_db
from database import models
from api.schemas import auction_schemas
from api.dependencies import get_current_user, get_current_admin

router = APIRouter()

@router.get("/", response_model=List[auction_schemas.Auction])
async def get_auctions(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all auctions, optionally filtered by status"""
    query = db.query(models.Auction)
    
    if status:
        query = query.filter(models.Auction.status == status)
    
    auctions = query.order_by(models.Auction.auction_date.desc()).offset(skip).limit(limit).all()
    return auctions

@router.get("/{auction_id}", response_model=auction_schemas.Auction)
async def get_auction(auction_id: str, db: Session = Depends(get_db)):
    """Get auction by ID"""
    auction = db.query(models.Auction).filter(models.Auction.id == auction_id).first()
    
    if not auction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found"
        )
    
    return auction

@router.post("/", response_model=auction_schemas.Auction, status_code=status.HTTP_201_CREATED)
async def create_auction(
    auction: auction_schemas.AuctionCreate,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create new auction (Admin only)"""
    db_auction = models.Auction(
        title=auction.title,
        description=auction.description,
        image_url=auction.image_url,
        category=auction.category,
        starting_price=auction.starting_price,
        current_price=auction.starting_price,
        auction_date=auction.auction_date,
        location=auction.location,
        status="scheduled",
        created_by=current_user.id
    )
    
    db.add(db_auction)
    db.commit()
    db.refresh(db_auction)
    
    return db_auction

@router.put("/{auction_id}", response_model=auction_schemas.Auction)
async def update_auction(
    auction_id: str,
    auction_update: auction_schemas.AuctionUpdate,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update auction (Admin only, only if status is 'scheduled')"""
    db_auction = db.query(models.Auction).filter(models.Auction.id == auction_id).first()
    
    if not db_auction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found"
        )
    
    if db_auction.status != "scheduled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only update scheduled auctions"
        )
    
    update_data = auction_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_auction, field, value)
    
    db.commit()
    db.refresh(db_auction)
    
    return db_auction

@router.post("/{auction_id}/start", response_model=auction_schemas.Auction)
async def start_auction(
    auction_id: str,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Start auction - change status to 'live' (Admin only)"""
    db_auction = db.query(models.Auction).filter(models.Auction.id == auction_id).first()
    
    if not db_auction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found"
        )
    
    if db_auction.status != "scheduled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Auction is already {db_auction.status}"
        )
    
    db_auction.status = "live"
    db.commit()
    db.refresh(db_auction)
    
    return db_auction

@router.post("/{auction_id}/end", response_model=auction_schemas.Auction)
async def end_auction(
    auction_id: str,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """End auction - change status to 'completed' (Admin only)"""
    db_auction = db.query(models.Auction).filter(models.Auction.id == auction_id).first()
    
    if not db_auction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found"
        )
    
    if db_auction.status != "live":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only end live auctions"
        )
    
    db_auction.status = "completed"
    db.commit()
    db.refresh(db_auction)
    
    return db_auction

@router.delete("/{auction_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_auction(
    auction_id: str,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete auction (Admin only, only if status is 'scheduled')"""
    db_auction = db.query(models.Auction).filter(models.Auction.id == auction_id).first()
    
    if not db_auction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found"
        )
    
    if db_auction.status != "scheduled":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only delete scheduled auctions"
        )
    
    db.delete(db_auction)
    db.commit()
    
    return None
