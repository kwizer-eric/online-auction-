"""
FastAPI Main Application
Live Auction System Backend
"""

from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import uvicorn

from database.database import get_db, engine
from database import models
from api.routers import auth, auctions, bids, registrations, chat

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Live Auction API",
    description="Backend API for Live Auction System",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", 
        "http://localhost:5174", 
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(auctions.router, prefix="/api/auctions", tags=["Auctions"])
app.include_router(bids.router, prefix="/api/bids", tags=["Bids"])
app.include_router(registrations.router, prefix="/api/registrations", tags=["Registrations"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])

@app.get("/")
async def root():
    return {"message": "Live Auction API", "version": "1.0.0"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
