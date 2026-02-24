-- Live Auction System Database Schema
-- PostgreSQL Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'participant', -- 'admin', 'participant', 'onfield'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- Auctions Table
CREATE TABLE auctions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    category VARCHAR(100),
    starting_price DECIMAL(15, 2) NOT NULL,
    current_price DECIMAL(15, 2) NOT NULL,
    auction_date TIMESTAMP NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'live', 'completed'
    location VARCHAR(255),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Registrations Table (Participants)
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'online' or 'onfield'
    status VARCHAR(50) NOT NULL DEFAULT 'registered', -- 'registered', 'approved', 'rejected'
    bidder_number VARCHAR(50), -- For on-field participants
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(auction_id, user_id)
);

-- Bids Table
CREATE TABLE bids (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'online' or 'floor'
    bidder_name VARCHAR(255) NOT NULL,
    bidder_number VARCHAR(50), -- For floor bids
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_winning BOOLEAN DEFAULT FALSE
);

-- Chat Messages Table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auction_id UUID NOT NULL REFERENCES auctions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    message TEXT NOT NULL,
    is_admin_message BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_auctions_status ON auctions(status);
CREATE INDEX idx_auctions_auction_date ON auctions(auction_date);
CREATE INDEX idx_registrations_auction_id ON registrations(auction_id);
CREATE INDEX idx_registrations_user_id ON registrations(user_id);
CREATE INDEX idx_bids_auction_id ON bids(auction_id);
CREATE INDEX idx_bids_timestamp ON bids(timestamp DESC);
CREATE INDEX idx_chat_auction_id ON chat_messages(auction_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON auctions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update current_price when new bid is placed
CREATE OR REPLACE FUNCTION update_auction_price()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE auctions
    SET current_price = NEW.amount,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.auction_id
    AND NEW.amount > current_price;
    
    -- Mark previous winning bid as false
    UPDATE bids
    SET is_winning = FALSE
    WHERE auction_id = NEW.auction_id
    AND is_winning = TRUE;
    
    -- Mark new bid as winning
    UPDATE bids
    SET is_winning = TRUE
    WHERE id = NEW.id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for bid updates
CREATE TRIGGER update_price_on_bid AFTER INSERT ON bids
    FOR EACH ROW EXECUTE FUNCTION update_auction_price();
