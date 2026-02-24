# Backend API Integration Guide

## Overview
This document outlines how to integrate the React frontend with the FastAPI backend.

## Base URL
```
http://localhost:8000
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "username": "johndoe"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=user@example.com&password=password123
```

Response:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "participant"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Auctions

#### Get All Auctions
```http
GET /api/auctions?status=scheduled&skip=0&limit=100
```

#### Get Auction by ID
```http
GET /api/auctions/{auction_id}
```

#### Create Auction (Admin)
```http
POST /api/auctions
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Vintage Rolex",
  "description": "Description here",
  "image_url": "https://...",
  "category": "Watches",
  "starting_price": 8500.00,
  "auction_date": "2024-12-25T10:00:00",
  "location": "Central Bank - Hall A"
}
```

#### Update Auction (Admin)
```http
PUT /api/auctions/{auction_id}
Authorization: Bearer <admin_token>
```

#### Start Auction (Admin)
```http
POST /api/auctions/{auction_id}/start
Authorization: Bearer <admin_token>
```

#### End Auction (Admin)
```http
POST /api/auctions/{auction_id}/end
Authorization: Bearer <admin_token>
```

### Bids

#### Place Bid
```http
POST /api/bids
Authorization: Bearer <token>
Content-Type: application/json

{
  "auction_id": "uuid",
  "amount": 9000.00
}
```

#### Place Floor Bid (Admin)
```http
POST /api/bids/floor
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "auction_id": "uuid",
  "amount": 9500.00,
  "bidder_name": "Floor Paddle #42",
  "bidder_number": "42"
}
```

#### Get Auction Bids
```http
GET /api/bids/auction/{auction_id}?skip=0&limit=100
```

### Registrations

#### Register for Auction
```http
POST /api/registrations
Authorization: Bearer <token>
Content-Type: application/json

{
  "auction_id": "uuid",
  "type": "online"  // or "onfield"
}
```

#### Get Auction Registrations (Admin)
```http
GET /api/registrations/auction/{auction_id}
Authorization: Bearer <admin_token>
```

#### Get User Registrations
```http
GET /api/registrations/user/{user_id}
Authorization: Bearer <token>
```

#### Unregister from Auction
```http
DELETE /api/registrations/{registration_id}
Authorization: Bearer <token>
```

## WebSocket Connection

### Connect to Auction Room
```javascript
const ws = new WebSocket('ws://localhost:8000/api/bids/ws/{auction_id}');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle bid updates
};
```

## Frontend Integration

### Update API Service

Create `src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

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

export default api;
```

### Update Auth Context

Modify `src/contexts/AuthContext.jsx` to use real API:

```javascript
import api from '../services/api';

const login = async (email, password) => {
  const formData = new FormData();
  formData.append('username', email);
  formData.append('password', password);
  
  const response = await api.post('/api/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
  
  localStorage.setItem('access_token', response.data.access_token);
  setUser(response.data.user);
  return { success: true, user: response.data.user };
};
```

### Update Auction Service

Modify `src/services/auctionService.js` to use API:

```javascript
import api from './api';

class AuctionService {
  async loadAuctions() {
    const response = await api.get('/api/auctions');
    return response.data;
  }
  
  async startAuction(auctionId) {
    const response = await api.post(`/api/auctions/${auctionId}/start`);
    return response.data;
  }
  
  // ... other methods
}
```

## Environment Variables

Create `.env` file in backend:

```
DATABASE_URL=postgresql://user:password@localhost:5432/auction_db
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Next Steps

1. Install dependencies: `pip install -r requirements.txt`
2. Set up PostgreSQL database
3. Run migrations: `alembic upgrade head`
4. Start server: `uvicorn main:app --reload`
5. Update frontend API service to use real endpoints
6. Test all endpoints with Postman/Thunder Client
