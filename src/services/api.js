/**
 * API Service for Backend Integration
 * Connects React frontend to FastAPI backend
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Auth endpoints
export const authAPI = {
    register: (userData) => api.post('/api/auth/register', userData),
    login: (email, password) => {
        const formData = new FormData();
        formData.append('username', email);
        formData.append('password', password);
        return api.post('/api/auth/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
    },
    getCurrentUser: () => api.get('/api/auth/me'),
};

// Auction endpoints
export const auctionAPI = {
    getAll: (params = {}) => api.get('/api/auctions', { params }),
    getById: (id) => api.get(`/api/auctions/${id}`),
    create: (auctionData) => api.post('/api/auctions', auctionData),
    update: (id, auctionData) => api.put(`/api/auctions/${id}`, auctionData),
    start: (id) => api.post(`/api/auctions/${id}/start`),
    end: (id) => api.post(`/api/auctions/${id}/end`),
    delete: (id) => api.delete(`/api/auctions/${id}`),
};

// Bid endpoints
export const bidAPI = {
    placeBid: (bidData) => api.post('/api/bids', bidData),
    placeFloorBid: (bidData) => api.post('/api/bids/floor', bidData),
    getAuctionBids: (auctionId, params = {}) =>
        api.get(`/api/bids/auction/${auctionId}`, { params }),
};

// Chat endpoints
export const chatAPI = {
    getHistory: (auctionId) => api.get(`/api/chat/${auctionId}`),
    sendMessage: (messageData) => api.post('/api/chat', messageData),
};

// Registration endpoints
export const registrationAPI = {
    register: (registrationData) => api.post('/api/registrations', registrationData),
    getAuctionRegistrations: (auctionId) =>
        api.get(`/api/registrations/auction/${auctionId}`),
    getUserRegistrations: (userId) =>
        api.get(`/api/registrations/user/${userId}`),
    unregister: (registrationId) =>
        api.delete(`/api/registrations/${registrationId}`),
    approve: (registrationId) =>
        api.post(`/api/registrations/${registrationId}/approve`),
    reject: (registrationId) =>
        api.post(`/api/registrations/${registrationId}/reject`),
    assignBidderNumber: (registrationId, bidderNumber) =>
        api.put(`/api/registrations/${registrationId}/bidder-number`, null, { params: { bidder_number: bidderNumber } }),
};

export default api;
