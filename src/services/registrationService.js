// Registration service for auction participants
// Manages on-field and online registrations

class RegistrationService {
    constructor() {
        this.registrations = this.loadRegistrations();
    }

    loadRegistrations() {
        const stored = localStorage.getItem('auctionRegistrations');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Error loading registrations:', e);
            }
        }
        return [];
    }

    saveRegistrations() {
        localStorage.setItem('auctionRegistrations', JSON.stringify(this.registrations));
    }

    // Register user for an auction
    register(auctionId, userId, type = 'online', userData = {}) {
        const existing = this.registrations.find(
            r => r.auctionId === Number(auctionId) && r.userId === userId
        );

        if (existing) {
            return { success: false, error: 'Already registered for this auction' };
        }

        const registration = {
            id: Date.now(),
            auctionId: Number(auctionId),
            userId,
            type, // 'online' or 'onfield'
            status: 'registered', // 'registered', 'approved', 'rejected'
            registeredAt: new Date().toISOString(),
            ...userData
        };

        this.registrations.push(registration);
        this.saveRegistrations();

        return { success: true, registration };
    }

    // Unregister from auction
    unregister(auctionId, userId) {
        const index = this.registrations.findIndex(
            r => r.auctionId === Number(auctionId) && r.userId === userId
        );

        if (index === -1) {
            return { success: false, error: 'Not registered for this auction' };
        }

        this.registrations.splice(index, 1);
        this.saveRegistrations();

        return { success: true };
    }

    // Check if user is registered
    isRegistered(auctionId, userId) {
        return this.registrations.some(
            r => r.auctionId === Number(auctionId) && r.userId === userId
        );
    }

    // Get registration for user and auction
    getRegistration(auctionId, userId) {
        return this.registrations.find(
            r => r.auctionId === Number(auctionId) && r.userId === userId
        );
    }

    // Get all registrations for an auction
    getAuctionRegistrations(auctionId) {
        return this.registrations.filter(r => r.auctionId === Number(auctionId));
    }

    // Get all registrations for a user
    getUserRegistrations(userId) {
        return this.registrations.filter(r => r.userId === userId);
    }

    // Admin: Approve registration
    approveRegistration(registrationId) {
        const registration = this.registrations.find(r => r.id === registrationId);
        if (registration) {
            registration.status = 'approved';
            this.saveRegistrations();
            return { success: true, registration };
        }
        return { success: false, error: 'Registration not found' };
    }

    // Admin: Reject registration
    rejectRegistration(registrationId) {
        const registration = this.registrations.find(r => r.id === registrationId);
        if (registration) {
            registration.status = 'rejected';
            this.saveRegistrations();
            return { success: true, registration };
        }
        return { success: false, error: 'Registration not found' };
    }

    // Get registration counts
    getRegistrationCounts(auctionId) {
        const auctionRegs = this.getAuctionRegistrations(auctionId);
        return {
            total: auctionRegs.length,
            online: auctionRegs.filter(r => r.type === 'online').length,
            onfield: auctionRegs.filter(r => r.type === 'onfield').length,
            approved: auctionRegs.filter(r => r.status === 'approved').length,
            pending: auctionRegs.filter(r => r.status === 'registered').length
        };
    }
}

export const registrationService = new RegistrationService();
