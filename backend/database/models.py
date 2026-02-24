"""
SQLAlchemy Database Models
"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Text, DECIMAL, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from database.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    username = Column(String(100), unique=True)
    role = Column(String(50), nullable=False, default="participant")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)

    # Relationships
    auctions_created = relationship("Auction", back_populates="creator")
    registrations = relationship("Registration", back_populates="user")
    bids = relationship("Bid", back_populates="user")

class Auction(Base):
    __tablename__ = "auctions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    image_url = Column(String(500))
    category = Column(String(100))
    starting_price = Column(DECIMAL(15, 2), nullable=False)
    current_price = Column(DECIMAL(15, 2), nullable=False)
    auction_date = Column(DateTime, nullable=False)
    status = Column(String(50), nullable=False, default="scheduled")
    location = Column(String(255))
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    creator = relationship("User", back_populates="auctions_created")
    registrations = relationship("Registration", back_populates="auction", cascade="all, delete-orphan")
    bids = relationship("Bid", back_populates="auction", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="auction", cascade="all, delete-orphan")

class Registration(Base):
    __tablename__ = "registrations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    auction_id = Column(UUID(as_uuid=True), ForeignKey("auctions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)  # 'online' or 'onfield'
    status = Column(String(50), nullable=False, default="registered")
    bidder_number = Column(String(50))
    registered_at = Column(DateTime, server_default=func.now())

    # Relationships
    auction = relationship("Auction", back_populates="registrations")
    user = relationship("User", back_populates="registrations")

    __table_args__ = (UniqueConstraint('auction_id', 'user_id', name='unique_auction_user'),)

class Bid(Base):
    __tablename__ = "bids"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    auction_id = Column(UUID(as_uuid=True), ForeignKey("auctions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    amount = Column(DECIMAL(15, 2), nullable=False)
    type = Column(String(50), nullable=False)  # 'online' or 'floor'
    bidder_name = Column(String(255), nullable=False)
    bidder_number = Column(String(50))
    timestamp = Column(DateTime, server_default=func.now())
    is_winning = Column(Boolean, default=False)

    # Relationships
    auction = relationship("Auction", back_populates="bids")
    user = relationship("User", back_populates="bids")

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    auction_id = Column(UUID(as_uuid=True), ForeignKey("auctions.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    message = Column(Text, nullable=False)
    is_admin_message = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    auction = relationship("Auction", back_populates="chat_messages")
    user = relationship("User", foreign_keys=[user_id])
