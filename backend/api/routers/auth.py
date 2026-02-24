"""
Authentication Router
Handles user registration, login, and JWT tokens
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from database.database import get_db
from database import models
from api.schemas import auth_schemas
from api.dependencies import get_current_user
from api.utils.auth import verify_password, get_password_hash, create_access_token
from api.config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

@router.post("/register", response_model=auth_schemas.User, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: auth_schemas.UserCreate,
    db: Session = Depends(get_db)
):
    """Register a new user"""
    # Check if email already exists
    existing_user = db.query(models.User).filter(models.User.email == user_data.email).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Check if username already exists
    if user_data.username:
        existing_username = db.query(models.User).filter(models.User.username == user_data.username).first()
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Create new user
    db_user = models.User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        name=user_data.name,
        username=user_data.username,
        role="participant"
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=auth_schemas.Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """Login and get access token"""
    # Find user by email (OAuth2PasswordRequestForm uses 'username' field)
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email, "role": user.role},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@router.get("/me", response_model=auth_schemas.User)
async def get_current_user_info(
    current_user: models.User = Depends(get_current_user)
):
    """Get current user information"""
    return current_user
