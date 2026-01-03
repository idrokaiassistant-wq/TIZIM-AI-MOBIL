-- SQLite Database Schema for Tizim AI MVP
-- PostgreSQL schema'ni SQLite uchun moslashtirilgan

-- 1. users (Foydalanuvchilar)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'Asia/Tashkent',
    language TEXT DEFAULT 'uz',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. tasks (Vazifalar)
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Ish',
    priority TEXT DEFAULT 'medium', -- low, medium, high
    status TEXT DEFAULT 'pending', -- pending, in_progress, done, cancelled
    is_focus INTEGER DEFAULT 0, -- BOOLEAN as INTEGER (0/1)
    due_date TIMESTAMP,
    start_time TEXT, -- TIME as TEXT
    end_time TEXT, -- TIME as TEXT
    color TEXT DEFAULT 'indigo',
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_is_focus ON tasks(is_focus);

-- 3. habits (Odatlar)
CREATE TABLE IF NOT EXISTS habits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    goal TEXT NOT NULL, -- '30 min', '2 Litr', 'Har kuni'
    category TEXT, -- 'Salomatlik', 'O\'qish', 'Sport'
    icon TEXT DEFAULT 'Zap',
    color TEXT DEFAULT 'text-purple-500',
    bg_color TEXT DEFAULT 'bg-purple-100',
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1, -- BOOLEAN as INTEGER (0/1)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_is_active ON habits(is_active);

-- 4. habit_completions (Odatlar Bajarilishi)
CREATE TABLE IF NOT EXISTS habit_completions (
    id TEXT PRIMARY KEY,
    habit_id TEXT NOT NULL,
    completion_date DATE NOT NULL,
    progress INTEGER DEFAULT 0, -- 0-100
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habit_id) REFERENCES habits(id) ON DELETE CASCADE,
    UNIQUE(habit_id, completion_date)
);

CREATE INDEX IF NOT EXISTS idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_completions_date ON habit_completions(completion_date);

-- 5. transactions (Moliyaviy Tranzaksiyalar)
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'Oziq-ovqat', 'Maosh', 'Transport'
    amount REAL NOT NULL, -- DECIMAL as REAL
    transaction_type TEXT NOT NULL, -- 'income', 'expense'
    transaction_date DATE NOT NULL,
    icon TEXT DEFAULT 'CreditCard',
    color TEXT DEFAULT 'bg-slate-100 text-slate-600',
    receipt_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);

-- 6. budgets (Byudjetlar)
CREATE TABLE IF NOT EXISTS budgets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category TEXT NOT NULL,
    amount REAL NOT NULL, -- DECIMAL as REAL
    period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
    start_date DATE NOT NULL,
    end_date DATE,
    is_active INTEGER DEFAULT 1, -- BOOLEAN as INTEGER (0/1)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_active ON budgets(is_active);

-- 7. productivity_logs (Produktivlik Jurnali)
CREATE TABLE IF NOT EXISTS productivity_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    log_date DATE NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    tasks_total INTEGER DEFAULT 0,
    habits_completed INTEGER DEFAULT 0,
    habits_total INTEGER DEFAULT 0,
    focus_time_minutes INTEGER DEFAULT 0,
    energy_level INTEGER DEFAULT 5, -- 1-10
    mood TEXT, -- 'great', 'good', 'ok', 'bad', 'terrible'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, log_date)
);

CREATE INDEX IF NOT EXISTS idx_productivity_logs_user_id ON productivity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_productivity_logs_date ON productivity_logs(log_date);

-- 8. notes (Eslatmalar)
CREATE TABLE IF NOT EXISTS notes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    note_date DATE NOT NULL,
    content TEXT NOT NULL,
    tags TEXT, -- JSON array as TEXT (comma-separated or JSON)
    is_pinned INTEGER DEFAULT 0, -- BOOLEAN as INTEGER (0/1)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_date ON notes(note_date);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(is_pinned);

-- 9. categories (Kategoriyalar - Umumiy)
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    user_id TEXT, -- NULL = default categories
    name TEXT NOT NULL,
    type TEXT NOT NULL, -- 'task', 'habit', 'transaction'
    color TEXT,
    icon TEXT,
    is_default INTEGER DEFAULT 0, -- BOOLEAN as INTEGER (0/1)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

