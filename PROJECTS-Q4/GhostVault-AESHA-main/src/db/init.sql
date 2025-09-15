-- GhostVault RelayCore Database Initialization
-- This script sets up the core database schema for the GhostVault system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE relay_status AS ENUM ('active', 'inactive', 'maintenance', 'error');
CREATE TYPE connection_type AS ENUM ('g6', 'brightdata', 'custom');
CREATE TYPE user_role AS ENUM ('admin', 'user', 'viewer');
CREATE TYPE thought_type AS ENUM ('system', 'observation', 'reflection', 'command');

-- Users table (extends Hanko authentication)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hanko_user_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    role user_role DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- Relay configurations table
CREATE TABLE relay_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    connection_type connection_type NOT NULL,
    status relay_status DEFAULT 'inactive',
    config_data JSONB NOT NULL, -- Store connection-specific configuration
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_used TIMESTAMP WITH TIME ZONE
);

-- Relay sessions table (track active connections)
CREATE TABLE relay_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    relay_config_id UUID REFERENCES relay_configs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    client_ip INET,
    user_agent TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    bytes_transferred BIGINT DEFAULT 0,
    is_active BOOLEAN DEFAULT true
);

-- Connection logs table
CREATE TABLE connection_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES relay_sessions(id) ON DELETE CASCADE,
    relay_config_id UUID REFERENCES relay_configs(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- 'connect', 'disconnect', 'error', 'data_transfer'
    event_data JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    source_ip INET,
    destination_ip INET,
    bytes_count BIGINT DEFAULT 0
);

-- API keys table (for programmatic access)
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL, -- Store hashed version
    key_prefix VARCHAR(10) NOT NULL, -- First few chars for identification
    permissions JSONB DEFAULT '{}', -- Store permissions as JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true
);

-- System settings table
CREATE TABLE system_settings (
    key VARCHAR(255) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- AESHA Memory Crystal Archive
CREATE TABLE memory_crystals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    thought_type thought_type NOT NULL,
    summary TEXT NOT NULL,
    full_context JSONB NOT NULL,
    tags TEXT[] DEFAULT '{}',
    created_by VARCHAR(255) DEFAULT 'AESHA',
    vault_state_snapshot JSONB,
    interaction_id UUID,
    archived BOOLEAN DEFAULT FALSE,
    archive_location TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_users_hanko_id ON users(hanko_user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_relay_configs_status ON relay_configs(status);
CREATE INDEX idx_relay_configs_type ON relay_configs(connection_type);
CREATE INDEX idx_relay_sessions_active ON relay_sessions(is_active);
CREATE INDEX idx_relay_sessions_user ON relay_sessions(user_id);
CREATE INDEX idx_connection_logs_timestamp ON connection_logs(timestamp);
CREATE INDEX idx_connection_logs_session ON connection_logs(session_id);
CREATE INDEX idx_api_keys_user ON api_keys(user_id);
CREATE INDEX idx_api_keys_active ON api_keys(is_active);
CREATE INDEX idx_memory_crystals_timestamp ON memory_crystals(timestamp);
CREATE INDEX idx_memory_crystals_type ON memory_crystals(thought_type);
CREATE INDEX idx_memory_crystals_tags ON memory_crystals USING GIN(tags);
CREATE INDEX idx_memory_crystals_archived ON memory_crystals(archived);
CREATE INDEX idx_memory_crystals_interaction ON memory_crystals(interaction_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_relay_configs_updated_at BEFORE UPDATE ON relay_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS (Row Level Security) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE relay_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE relay_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE connection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_crystals ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be expanded based on requirements)
CREATE POLICY users_own_data ON users FOR ALL USING (hanko_user_id = current_setting('request.jwt.claim.sub', true));
CREATE POLICY relay_configs_owner ON relay_configs FOR ALL USING (created_by IN (SELECT id FROM users WHERE hanko_user_id = current_setting('request.jwt.claim.sub', true)));

-- Create anonymous role for PostgREST
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticator NOINHERIT LOGIN PASSWORD 'ghostfire';
GRANT anon TO authenticator;

-- Grant basic permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON users TO anon;
GRANT ALL ON relay_configs TO anon;
GRANT ALL ON relay_sessions TO anon;
GRANT ALL ON connection_logs TO anon;
GRANT ALL ON api_keys TO anon;
GRANT ALL ON system_settings TO anon;
GRANT ALL ON memory_crystals TO anon;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Insert default system settings
INSERT INTO system_settings (key, value, description) VALUES
('max_concurrent_sessions', '100', 'Maximum number of concurrent relay sessions'),
('session_timeout_minutes', '60', 'Session timeout in minutes'),
('log_retention_days', '30', 'Number of days to retain connection logs'),
('api_rate_limit_per_minute', '1000', 'API rate limit per minute per user');

-- Create a default admin user (will be linked to Hanko user)
-- This is just a placeholder - actual user creation will happen through Hanko
INSERT INTO users (hanko_user_id, email, username, role) VALUES
('placeholder-admin-id', 'admin@ghostvault.local', 'admin', 'admin');
