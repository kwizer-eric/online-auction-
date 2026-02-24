import { io } from "socket.io-client";

// Simulation mode (since there is no real backend)
const IS_SIMULATION = true;

class SocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect() {
        if (IS_SIMULATION) {
            console.log("Socket.IO simulation mode active.");
            return;
        }

        // For real implementation:
        // this.socket = io("http://localhost:5000");
    }

    on(event, callback) {
        if (IS_SIMULATION) {
            if (!this.listeners.has(event)) {
                this.listeners.set(event, []);
            }
            this.listeners.get(event).push(callback);
            return;
        }
        this.socket.on(event, callback);
    }

    emit(event, data) {
        if (IS_SIMULATION) {
            console.log(`[SIMULATION] Emitting ${event}:`, data);

            // Simulate receiving a "bidUpdated" event after a small delay
            if (event === "placeBid") {
                setTimeout(() => {
                    const bidUpdate = {
                        auctionId: data.auctionId,
                        newPrice: data.amount,
                        bidderName: data.bidderName || "You",
                        type: 'online',
                        timestamp: new Date().toISOString()
                    };
                    this._triggerSimulationEvent("bidUpdated", bidUpdate);
                }, 500); // Faster response for better UX
            }

            // Simulate admin pushing a floor bid
            if (event === "broadcastFloorBid") {
                const floorBidderNames = ["Floor Paddle #42", "On-Field Agent", "Room Bidder #109", "Private Collector (Floor)", "Floor Bidder #12"];
                const randomName = floorBidderNames[Math.floor(Math.random() * floorBidderNames.length)];
                const bidUpdate = {
                    auctionId: data.auctionId,
                    newPrice: data.amount,
                    bidderName: randomName,
                    type: 'floor',
                    timestamp: new Date().toISOString()
                };
                // Broadcast immediately for floor bids
                this._triggerSimulationEvent("bidUpdated", bidUpdate);
            }

            // Simulate joining auction room
            if (event === "joinAuction") {
                setTimeout(() => {
                    this._triggerSimulationEvent("participantJoined", {
                        auctionId: data.auctionId,
                        participantCount: Math.floor(Math.random() * 20) + 5
                    });
                }, 300);
            }

            // Simulate leaving auction room
            if (event === "leaveAuction") {
                this._triggerSimulationEvent("participantLeft", {
                    auctionId: data.auctionId
                });
            }

            return;
        }
        this.socket.emit(event, data);
    }

    // Join auction room (for real-time updates)
    joinAuction(auctionId) {
        this.emit('joinAuction', { auctionId });
    }

    // Leave auction room
    leaveAuction(auctionId) {
        this.emit('leaveAuction', { auctionId });
    }

    _triggerSimulationEvent(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(callback => callback(data));
        }
    }

    disconnect() {
        if (IS_SIMULATION) return;
        this.socket.disconnect();
    }
}

export const socketService = new SocketService();
