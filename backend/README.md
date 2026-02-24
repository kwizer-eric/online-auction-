# Live Auction System - Backend

FastAPI backend with PostgreSQL database for the Live Auction System.

## Setup

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Up PostgreSQL Database

1. Create PostgreSQL database:
```sql
CREATE DATABASE auction_db;
```

2. Run the schema:
```bash
psql -U postgres -d auction_db -f database/schema.sql
```

### 3. Configure Environment Variables

Create `.env` file in the `backend` directory:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/auction_db
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 4. Run the Server

```bash
cd backend
uvicorn api.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
backend/
├── api/
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Configuration
│   ├── dependencies.py         # Auth dependencies
│   ├── routers/                # API routes
│   │   ├── auth.py
│   │   ├── auctions.py
│   │   ├── bids.py
│   │   ├── registrations.py
│   │   └── chat.py
│   ├── schemas/                # Pydantic schemas
│   │   ├── auth_schemas.py
│   │   ├── auction_schemas.py
│   │   ├── bid_schemas.py
│   │   └── registration_schemas.py
│   └── utils/
│       └── auth.py              # Auth utilities
├── database/
│   ├── database.py              # DB connection
│   ├── models.py                # SQLAlchemy models
│   └── schema.sql               # Database schema
├── requirements.txt
└── README.md
```

## Database Models

- **Users**: User accounts (admin, participant, onfield)
- **Auctions**: Auction listings
- **Registrations**: User registrations for auctions
- **Bids**: Bid records
- **ChatMessages**: Chat messages (future feature)

## API Endpoints

See `API_INTEGRATION.md` for detailed endpoint documentation.

## Development

### Running Migrations

If using Alembic (optional):
```bash
alembic upgrade head
```

### Testing

```bash
pytest
```

## Production Deployment

1. Set strong `SECRET_KEY` in environment
2. Use production database
3. Configure CORS origins
4. Use production WSGI server (e.g., Gunicorn)
5. Set up SSL/HTTPS
