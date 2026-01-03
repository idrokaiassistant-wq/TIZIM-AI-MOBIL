-- Migration: Add logs and metrics tables for monitoring
-- Created: 2024

-- Logs table for request/response logging
CREATE TABLE IF NOT EXISTS logs (
    id TEXT PRIMARY KEY,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id TEXT,
    endpoint TEXT,
    method TEXT,
    status_code INTEGER,
    response_time REAL,
    error_details TEXT,
    ip_address TEXT,
    user_agent TEXT
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_logs_timestamp ON logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_endpoint ON logs(endpoint);

-- Metrics table for storing metrics data
CREATE TABLE IF NOT EXISTS metrics (
    id TEXT PRIMARY KEY,
    metric_name TEXT NOT NULL,
    metric_value REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    tags TEXT
);

-- Create indexes for metrics
CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp);
CREATE INDEX IF NOT EXISTS idx_metrics_name ON metrics(metric_name);


