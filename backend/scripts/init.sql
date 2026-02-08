-- Initial database setup
-- This runs automatically when PostgreSQL container starts

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create indexes for full-text search (will be populated by EF migrations)
-- This is a placeholder for any raw SQL needed at DB init
