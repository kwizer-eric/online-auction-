/**
 * WebSocket Service – connects to the FastAPI native WebSocket server.
 * Each auction room uses the endpoint: ws://localhost:8000/api/bids/ws/{auctionId}
 */

const WS_BASE = (import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000');

class SocketService {
    constructor() {
        this.socket = null;
        this.currentAuctionId = null;
        this.listeners = new Map();
        this.reconnectTimer = null;
    }

    connect() {
        // No-op at top level – connections are per auction room
    }

    disconnect() {
        this._closeSocket();
    }

    /** Join an auction's WebSocket room */
    joinAuction(auctionId) {
        // Leave any previous room first
        if (this.currentAuctionId && this.currentAuctionId !== String(auctionId)) {
            this._closeSocket();
        }
        this.currentAuctionId = String(auctionId);
        this._openSocket(auctionId);
    }

    /** Leave the current auction room */
    leaveAuction(auctionId) {
        if (this.currentAuctionId === String(auctionId)) {
            this._closeSocket();
            this.currentAuctionId = null;
        }
    }

    /** Register an event listener */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /** Remove a specific listener */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const updated = this.listeners.get(event).filter(cb => cb !== callback);
            this.listeners.set(event, updated);
        }
    }

    /** Send a message (for future use) */
    emit(event, data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({ event, ...data }));
        } else {
            console.warn('[WS] Cannot send – socket not open');
        }
    }

    // ──────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────

    _openSocket(auctionId) {
        if (this.socket) return; // Already open

        const token = localStorage.getItem('access_token');
        const url = `${WS_BASE}/api/bids/ws/${auctionId}${token ? `?token=${token}` : ''}`;
        console.log('[WS] Connecting to', url);

        try {
            this.socket = new WebSocket(url);

            this.socket.onopen = () => {
                console.log('[WS] Connected to auction room', auctionId);
                if (this.reconnectTimer) {
                    clearTimeout(this.reconnectTimer);
                    this.reconnectTimer = null;
                }
            };

            this.socket.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    const type = message.type;
                    const data = message.data || message;
                    this._trigger(type, data);
                } catch (e) {
                    console.error('[WS] Failed to parse message:', e);
                }
            };

            this.socket.onclose = (e) => {
                console.log('[WS] Disconnected', e.code);
                this.socket = null;
                // Auto-reconnect after 3 s if we still have an active room
                if (this.currentAuctionId) {
                    this.reconnectTimer = setTimeout(() => {
                        this._openSocket(this.currentAuctionId);
                    }, 3000);
                }
            };

            this.socket.onerror = (err) => {
                console.error('[WS] Error:', err);
            };
        } catch (err) {
            console.error('[WS] Failed to open socket:', err);
        }
    }

    _closeSocket() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
        if (this.socket) {
            this.socket.onclose = null; // Prevent auto-reconnect
            this.socket.close();
            this.socket = null;
        }
    }

    _trigger(event, data) {
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.forEach(cb => cb(data));
        }
    }
}

export const socketService = new SocketService();
