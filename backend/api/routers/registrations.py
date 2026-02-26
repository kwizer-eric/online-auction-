"""
Registrations Router
Handles auction participant registration
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from database.database import get_db
from database import models
from api.schemas import registration_schemas
from api.dependencies import get_current_user, get_current_admin

router = APIRouter()

@router.post("/", response_model=registration_schemas.Registration, status_code=status.HTTP_201_CREATED)
async def register_for_auction(
    registration: registration_schemas.RegistrationCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register for an auction"""
    # Check if auction exists
    auction = db.query(models.Auction).filter(models.Auction.id == registration.auction_id).first()
    
    if not auction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found"
        )
    
    # Check if already registered
    existing = db.query(models.Registration).filter(
        models.Registration.auction_id == registration.auction_id,
        models.Registration.user_id == current_user.id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already registered for this auction"
        )
    
    # Create registration
    db_registration = models.Registration(
        auction_id=registration.auction_id,
        user_id=current_user.id,
        type=registration.type,
        status="registered"
    )
    
    db.add(db_registration)
    db.commit()
    db.refresh(db_registration)
    
    return db_registration

@router.get("/auction/{auction_id}", response_model=List[registration_schemas.Registration])
async def get_auction_registrations(
    auction_id: str,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all registrations for an auction (Admin only)"""
    registrations = db.query(models.Registration)\
        .filter(models.Registration.auction_id == auction_id)\
        .all()
    
    return registrations

@router.get("/user/{user_id}", response_model=List[registration_schemas.Registration])
async def get_user_registrations(
    user_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all registrations for a user"""
    # Users can only see their own registrations
    if str(current_user.id) != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    registrations = db.query(models.Registration)\
        .filter(models.Registration.user_id == user_id)\
        .all()
    
    return registrations

@router.delete("/{registration_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unregister_from_auction(
    registration_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Unregister from an auction"""
    registration = db.query(models.Registration).filter(
        models.Registration.id == registration_id
    ).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    # Users can only unregister themselves
    if str(registration.user_id) != str(current_user.id) and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized"
        )
    
    db.delete(registration)
    db.commit()
    
    return None

@router.post("/{registration_id}/approve", response_model=registration_schemas.Registration)
async def approve_registration(
    registration_id: UUID,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Approve a registration (Admin only)"""
    registration = db.query(models.Registration).filter(models.Registration.id == registration_id).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    registration.status = "approved"
    db.commit()
    db.refresh(registration)
    
    return registration

@router.post("/{registration_id}/reject", response_model=registration_schemas.Registration)
async def reject_registration(
    registration_id: UUID,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Reject a registration (Admin only)"""
    registration = db.query(models.Registration).filter(models.Registration.id == registration_id).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    registration.status = "rejected"
    db.commit()
    db.refresh(registration)
    
    return registration

@router.put("/{registration_id}/bidder-number", response_model=registration_schemas.Registration)
async def update_bidder_number(
    registration_id: UUID,
    bidder_number: str,
    current_user: models.User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Assign or update a bidder number (Admin only)"""
    registration = db.query(models.Registration).filter(models.Registration.id == registration_id).first()
    
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Registration not found"
        )
    
    registration.bidder_number = bidder_number
    db.commit()
    db.refresh(registration)
    
    return registration
