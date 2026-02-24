// Auction management service
// This will be replaced with real API calls when backend is ready

class AuctionService {
    constructor() {
        this.auctions = null; // Will be loaded from mock or API
    }

    // Load auctions (from mock data for now)
    loadAuctions() {
        // In real implementation, this would be an API call
        return new Promise((resolve) => {
            import('../mock/auctions').then(({ mockAuctions }) => {
                // Load from localStorage if available (for status persistence)
                const stored = localStorage.getItem('auctions');
                if (stored) {
                    try {
                        this.auctions = JSON.parse(stored);
                        resolve(this.auctions);
                        return;
                    } catch (e) {
                        console.error('Error loading stored auctions:', e);
                    }
                }
                this.auctions = mockAuctions;
                this.saveAuctions();
                resolve(this.auctions);
            });
        });
    }

    // Save auctions to localStorage (temporary until backend)
    saveAuctions() {
        if (this.auctions) {
            localStorage.setItem('auctions', JSON.stringify(this.auctions));
        }
    }

    // Get all auctions
    getAuctions() {
        return this.auctions || [];
    }

    // Get auction by ID
    getAuction(id) {
        return this.auctions?.find(a => a.id === Number(id));
    }

    // Start auction (change status to 'live')
    startAuction(auctionId) {
        if (!this.auctions) return null;

        const auction = this.auctions.find(a => a.id === Number(auctionId));
        if (!auction) return null;

        if (auction.status === 'scheduled') {
            auction.status = 'live';
            this.saveAuctions();
            return auction;
        }

        return null;
    }

    // End auction (change status to 'completed')
    endAuction(auctionId) {
        if (!this.auctions) return null;

        const auction = this.auctions.find(a => a.id === Number(auctionId));
        if (!auction) return null;

        if (auction.status === 'live') {
            auction.status = 'completed';
            this.saveAuctions();
            return auction;
        }

        return null;
    }

    // Update auction
    updateAuction(auctionId, updates) {
        if (!this.auctions) return null;

        const index = this.auctions.findIndex(a => a.id === Number(auctionId));
        if (index === -1) return null;

        this.auctions[index] = { ...this.auctions[index], ...updates };
        this.saveAuctions();
        return this.auctions[index];
    }
}

export const auctionService = new AuctionService();
