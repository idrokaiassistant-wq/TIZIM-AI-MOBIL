-- Migration 005: Add TelegramUser table for phone_number -> chat_id mapping

-- Create telegram_users table for storing phone number to chat_id mapping
CREATE TABLE IF NOT EXISTS telegram_users (
    phone_number TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_telegram_users_chat_id ON telegram_users(chat_id);

