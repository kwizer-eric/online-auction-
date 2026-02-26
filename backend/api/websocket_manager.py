"""
WebSocket Connection Manager
"""

from typing import Dict, List
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        # Dictionary mapping auction_id to list of connection dicts
        # { auction_id: [ { "websocket": ws, "user_id": uid, "user_name": name }, ... ] }
        self.active_connections: Dict[str, List[dict]] = {}

    async def connect(self, websocket: WebSocket, auction_id: str, user_id: str = None, user_name: str = None):
        """Accept WebSocket connection and add to auction room"""
        await websocket.accept()
        
        if auction_id not in self.active_connections:
            self.active_connections[auction_id] = []
        
        self.active_connections[auction_id].append({
            "websocket": websocket,
            "user_id": user_id,
            "user_name": user_name or "Anonymous"
        })
        
        # Notify others about the participants list
        await self.broadcast_participant_update(auction_id)

    async def disconnect(self, websocket: WebSocket, auction_id: str):
        """Remove WebSocket connection from auction room"""
        if auction_id in self.active_connections:
            self.active_connections[auction_id] = [
                c for c in self.active_connections[auction_id] 
                if c["websocket"] != websocket
            ]
            
            # Clean up empty rooms
            if not self.active_connections[auction_id]:
                del self.active_connections[auction_id]
            else:
                # Notify others about the participants list
                await self.broadcast_participant_update(auction_id)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """Send message to specific WebSocket"""
        await websocket.send_text(json.dumps(message))

    async def broadcast_bid_update(self, auction_id: str, bid_data: dict):
        """Broadcast bid update to all connections in auction room"""
        if auction_id not in self.active_connections:
            return
        
        message = {
            "type": "bidUpdated",
            "data": bid_data
        }
        
        disconnected = []
        for connection in self.active_connections[auction_id]:
            try:
                await connection["websocket"].send_text(json.dumps(message))
            except:
                disconnected.append(connection["websocket"])
        
        # Remove disconnected connections
        for ws in disconnected:
            await self.disconnect(ws, auction_id)

    async def broadcast_participant_update(self, auction_id: str):
        """Broadcast participant list/count update"""
        if auction_id not in self.active_connections:
            return
        
        participants = [
            {"user_id": c["user_id"], "user_name": c["user_name"]}
            for c in self.active_connections[auction_id]
        ]
        
        message = {
            "type": "participantUpdate",
            "data": {
                "count": len(participants),
                "participants": participants
            }
        }
        
        disconnected = []
        for connection in self.active_connections[auction_id]:
            try:
                await connection["websocket"].send_text(json.dumps(message))
            except:
                disconnected.append(connection["websocket"])
        
        for ws in disconnected:
            await self.disconnect(ws, auction_id)

    async def broadcast_chat_message(self, auction_id: str, message_data: dict):
        """Broadcast chat message to all connections in auction room"""
        if auction_id not in self.active_connections:
            return
        
        message = {
            "type": "chatMessage",
            "data": message_data
        }
        
        disconnected = []
        for connection in self.active_connections[auction_id]:
            try:
                await connection["websocket"].send_text(json.dumps(message))
            except:
                disconnected.append(connection["websocket"])
        
        # Remove disconnected connections
        for ws in disconnected:
            await self.disconnect(ws, auction_id)

    async def broadcast_auction_status(self, auction_id: str, status: str):
        """Broadcast auction status change"""
        message = {
            "type": "auctionStatus",
            "data": {
                "auctionId": auction_id,
                "status": status
            }
        }
        
        await self.broadcast_bid_update(auction_id, message["data"])

manager = ConnectionManager()
