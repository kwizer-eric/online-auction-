"""
Chat Router
Handles auction room chat messages
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from database.database import get_db
from database import models
from api.schemas import chat_schemas
from api.dependencies import get_current_user
from api.websocket_manager import manager

router = APIRouter()

@router.get("/{auction_id}", response_model=List[chat_schemas.ChatMessage])
async def get_chat_history(
    auction_id: UUID,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get chat history for an auction"""
    messages = db.query(models.ChatMessage)\
        .filter(models.ChatMessage.auction_id == auction_id)\
        .order_by(models.ChatMessage.created_at.asc())\
        .limit(limit)\
        .all()
    
    # Add user names to messages
    for msg in messages:
        if msg.user_id:
            user = db.query(models.User).filter(models.User.id == msg.user_id).first()
            msg.user_name = user.name if user else "Unknown User"
        else:
            msg.user_name = "System"
            
    return messages

@router.post("/", response_model=chat_schemas.ChatMessage)
async def send_chat_message(
    chat_msg: chat_schemas.ChatMessageCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Send a chat message to an auction room"""
    # Check if auction exists
    auction = db.query(models.Auction).filter(models.Auction.id == chat_msg.auction_id).first()
    if not auction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Auction not found"
        )
    
    # Create database entry
    db_msg = models.ChatMessage(
        auction_id=chat_msg.auction_id,
        user_id=current_user.id,
        message=chat_msg.message,
        is_admin_message=(current_user.role == "admin")
    )
    
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)
    
    # Prepare data for broadcast
    broadcast_data = {
        "id": str(db_msg.id),
        "auction_id": str(db_msg.auction_id),
        "user_id": str(db_msg.user_id),
        "user_name": current_user.name,
        "message": db_msg.message,
        "is_admin_message": db_msg.is_admin_message,
        "created_at": db_msg.created_at.isoformat()
    }
    
    # Broadcast via WebSocket
    await manager.broadcast_chat_message(str(chat_msg.auction_id), broadcast_data)
    
    # Add user_name for response model compatibility
    db_msg.user_name = current_user.name
    
    return db_msg
