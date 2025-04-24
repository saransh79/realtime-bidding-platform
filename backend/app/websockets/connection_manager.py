from fastapi import WebSocket
from typing import Dict, List, Set
import json

class ConnectionManager:
    def __init__(self):
        # All active connections
        self.active_connections: List[WebSocket] = []
        # Map auction_id to set of connected WebSockets
        self.auction_connections: Dict[int, Set[WebSocket]] = {}
        # Map user_id to WebSocket
        self.user_connections: Dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, auction_id: int = None, user_id: int = None):
        await websocket.accept()
        self.active_connections.append(websocket)
        
        # Add to auction-specific connections
        if auction_id is not None:
            if auction_id not in self.auction_connections:
                self.auction_connections[auction_id] = set()
            self.auction_connections[auction_id].add(websocket)
        
        # Map user to their connection
        if user_id is not None:
            self.user_connections[user_id] = websocket

    def disconnect(self, websocket: WebSocket, auction_id: int = None, user_id: int = None):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        
        # Remove from auction-specific connections
        if auction_id is not None and auction_id in self.auction_connections:
            if websocket in self.auction_connections[auction_id]:
                self.auction_connections[auction_id].remove(websocket)
            # Clean up empty sets
            if not self.auction_connections[auction_id]:
                del self.auction_connections[auction_id]
        
        # Remove user connection
        if user_id is not None and user_id in self.user_connections:
            del self.user_connections[user_id]

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_text(json.dumps(message))

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_text(json.dumps(message))

    async def broadcast_to_auction(self, auction_id: int, message: dict):
        if auction_id in self.auction_connections:
            for connection in self.auction_connections[auction_id]:
                await connection.send_text(json.dumps(message))

    async def send_to_user(self, user_id: int, message: dict):
        if user_id in self.user_connections:
            await self.user_connections[user_id].send_text(json.dumps(message))

connection_manager = ConnectionManager() 