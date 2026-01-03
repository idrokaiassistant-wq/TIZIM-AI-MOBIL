-- Migration 004: Add Telegram authentication support
-- Adds phone_number to users table and creates telegram_codes table

-- Add phone_number column to users table (nullable, unique)
-- Note: email and password_hash are now nullable to support Telegram-only users
ALTER TABLE users ADD COLUMN phone_number TEXT;

-- Create unique index on phone_number
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone_number ON users(phone_number) WHERE phone_number IS NOT NULL;

-- Create telegram_codes table for storing verification codes
CREATE TABLE IF NOT EXISTS telegram_codes (
    phone_number TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_telegram_codes_expires_at ON telegram_codes(expires_at);

