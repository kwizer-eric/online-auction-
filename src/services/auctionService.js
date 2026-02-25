/**
 * Auction Service – wired to the real FastAPI backend via api.js
 */
import { auctionAPI } from './api';

class AuctionService {
    constructor() {
        this._cache = null;
    }

    async loadAuctions(params = {}) {
        try {
            const res = await auctionAPI.getAll(params);
            this._cache = res.data;
            return this._cache;
        } catch (err) {
            console.error('Failed to load auctions:', err);
            return [];
        }
    }

    getAuctions() {
        return this._cache || [];
    }

    async getAuction(id) {
        try {
            const res = await auctionAPI.getById(id);
            return res.data;
        } catch (err) {
            console.error('Failed to load auction:', err);
            return null;
        }
    }

    async startAuction(auctionId) {
        try {
            const res = await auctionAPI.start(auctionId);
            // Refresh cache
            await this.loadAuctions();
            return res.data;
        } catch (err) {
            console.error('Failed to start auction:', err);
            return null;
        }
    }

    async endAuction(auctionId) {
        try {
            const res = await auctionAPI.end(auctionId);
            await this.loadAuctions();
            return res.data;
        } catch (err) {
            console.error('Failed to end auction:', err);
            return null;
        }
    }

    async createAuction(data) {
        try {
            const res = await auctionAPI.create(data);
            await this.loadAuctions();
            return res.data;
        } catch (err) {
            console.error('Failed to create auction:', err);
            throw err;
        }
    }

    async updateAuction(auctionId, updates) {
        try {
            const res = await auctionAPI.update(auctionId, updates);
            await this.loadAuctions();
            return res.data;
        } catch (err) {
            console.error('Failed to update auction:', err);
            return null;
        }
    }
}

export const auctionService = new AuctionService();
