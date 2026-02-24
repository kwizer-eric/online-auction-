"""
WebSocket Connection Manager
"""

from typing import Dict, List
from fastapi import WebSocket
import json

class ConnectionManager:
    def __init__(self):
        # Dictionary mapping auction_id to list of WebSocket connections
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, auction_id: str):
        """Accept WebSocket connection and add to auction room"""
        await websocket.accept()
        
        if auction_id not in self.active_connections:
            self.active_connections[auction_id] = []
        
        self.active_connections[auction_id].append(websocket)
        
        # Notify others that someone joined
        await self.broadcast_participant_update(auction_id, {
            "type": "participant_joined",
            "count": len(self.active_connections[auction_id])
        })

    async def disconnect(self, websocket: WebSocket, auction_id: str):
        """Remove WebSocket connection from auction room"""
        if auction_id in self.active_connections:
            if websocket in self.active_connections[auction_id]:
                self.active_connections[auction_id].remove(websocket)
            
            # Clean up empty rooms
            if not self.active_connections[auction_id]:
                del self.active_connections[auction_id]
            else:
                # Notify others that someone left
                await self.broadcast_participant_update(auction_id, {
                    "type": "participant_left",
                    "count": len(self.active_connections[auction_id])
                })

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
                await connection.send_text(json.dumps(message))
            except:
                disconnected.append(connection)
        
        # Remove disconnected connections
        for conn in disconnected:
            self.disconnect(conn, auction_id)

    async def broadcast_participant_update(self, auction_id: str, data: dict):
        """Broadcast participant count update"""
        if auction_id not in self.active_connections:
            return
        
        message = {
            "type": "participantUpdate",
            "data": data
        }
        
        disconnected = []
        for connection in self.active_connections[auction_id]:
            try:
                await connection.send_text(json.dumps(message))
            except:
                disconnected.append(connection)
        
        for conn in disconnected:
            self.disconnect(conn, auction_id)

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
