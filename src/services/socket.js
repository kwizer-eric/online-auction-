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
                        timestamp: new Date().toISOString()
                    };
                    this._triggerSimulationEvent("bidUpdated", bidUpdate);
                }, 1000);
            }
            return;
        }
        this.socket.emit(event, data);
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
