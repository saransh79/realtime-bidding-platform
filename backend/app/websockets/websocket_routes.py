from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from app.database.db import get_db
from app.database.models import Auction as AuctionModel, User as UserModel
from app.services.auth import get_password_hash, verify_password
from app.websockets.connection_manager import connection_manager
import json

router = APIRouter()

async def authenticate_websocket(websocket: WebSocket, db: Session):
    """Authenticate WebSocket connection using token or credentials"""
    try:
        # Wait for authentication data
        auth_text = await websocket.receive_text()
        auth_data = json.loads(auth_text)
        
        # Check authentication method
        if "token" in auth_data:
            # Token-based authentication would go here
            # For simplicity, we'll use username/password
            return None
        elif "username" in auth_data and "password" in auth_data:
            user = db.query(UserModel).filter(UserModel.username == auth_data["username"]).first()
            if user and verify_password(auth_data["password"], user.hashed_password):
                return user
        
        return None
    except:
        return None

@router.websocket("/ws/auctions/{auction_id}")
async def auction_websocket(websocket: WebSocket, auction_id: int, db: Session = Depends(get_db)):
    # First accept the connection
    await websocket.accept()
    
    # Check if the auction exists
    auction = db.query(AuctionModel).filter(AuctionModel.id == auction_id).first()
    if not auction:
        await websocket.send_text(json.dumps({"error": "Auction not found"}))
        await websocket.close()
        return
    
    # Authenticate the user (optional)
    user_id = None
    try:
        auth_text = await websocket.receive_text()
        auth_data = json.loads(auth_text)
        
        if "user_id" in auth_data:
            user_id = auth_data["user_id"]
            # In a real application, verify the user_id with a token
    except:
        pass  # If authentication fails, user can still watch the auction anonymously
    
    # Register the connection
    await connection_manager.connect(websocket, auction_id=auction_id, user_id=user_id)
    
    # Send initial auction data
    await connection_manager.send_personal_message({
        "event": "auction_data",
        "auction_id": auction.id,
        "title": auction.title,
        "description": auction.description,
        "current_price": auction.current_price,
        "end_time": auction.end_time.isoformat(),
        "is_active": auction.is_active
    }, websocket)
    
    try:
        # Keep the connection open
        while True:
            # Wait for messages from the client
            data = await websocket.receive_text()
            # You could process client messages here if needed
    except WebSocketDisconnect:
        # Handle disconnect
        connection_manager.disconnect(websocket, auction_id=auction_id, user_id=user_id)

@router.websocket("/ws/live-feed")
async def live_feed_websocket(websocket: WebSocket):
    await websocket.accept()
    
    # Connect to global feed
    await connection_manager.connect(websocket)
    
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connection_manager.disconnect(websocket) 