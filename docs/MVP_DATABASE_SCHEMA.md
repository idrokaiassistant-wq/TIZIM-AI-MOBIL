# MVP Ma'lumotlar Bazasi Strukturasi

## Umumiy Ma'lumot
- **Loyiha**: Tizim AI - Shaxsiy Produktivlik va Moliya Boshqaruvi
- **Ma'lumotlar bazasi turi**: PostgreSQL (yoki SQLite MVP uchun)
- **Versiya**: 1.0.0 MVP

---

## Jadval Strukturalari

### 1. users (Foydalanuvchilar)
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    timezone VARCHAR(50) DEFAULT 'Asia/Tashkent',
    language VARCHAR(10) DEFAULT 'uz',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
```

### 2. tasks (Vazifalar)
```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL DEFAULT 'Ish',
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, done, cancelled
    is_focus BOOLEAN DEFAULT FALSE,
    due_date TIMESTAMP,
    start_time TIME,
    end_time TIME,
    color VARCHAR(50) DEFAULT 'indigo',
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_is_focus ON tasks(is_focus);
```

### 3. habits (Odatlar)
```sql
CREATE TABLE habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    goal VARCHAR(100) NOT NULL, -- '30 min', '2 Litr', 'Har kuni'
    category VARCHAR(100), -- 'Salomatlik', 'O\'qish', 'Sport'
    icon VARCHAR(50) DEFAULT 'Zap',
    color VARCHAR(50) DEFAULT 'text-purple-500',
    bg_color VARCHAR(50) DEFAULT 'bg-purple-100',
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    total_completions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_habits_user_id ON habits(user_id);
CREATE INDEX idx_habits_is_active ON habits(is_active);
```

### 4. habit_completions (Odatlar Bajarilishi)
```sql
CREATE TABLE habit_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
    completion_date DATE NOT NULL,
    progress INTEGER DEFAULT 0, -- 0-100
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(habit_id, completion_date)
);

CREATE INDEX idx_habit_completions_habit_id ON habit_completions(habit_id);
CREATE INDEX idx_habit_completions_date ON habit_completions(completion_date);
```

### 5. transactions (Moliyaviy Tranzaksiyalar)
```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL, -- 'Oziq-ovqat', 'Maosh', 'Transport'
    amount DECIMAL(15, 2) NOT NULL, -- Manfiy: chiqim, Musbat: kirim
    transaction_type VARCHAR(20) NOT NULL, -- 'income', 'expense'
    transaction_date DATE NOT NULL,
    icon VARCHAR(50) DEFAULT 'CreditCard',
    color VARCHAR(100) DEFAULT 'bg-slate-100 text-slate-600',
    receipt_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_category ON transactions(category);
```

### 6. budgets (Byudjetlar)
```sql
CREATE TABLE budgets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    period VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
CREATE INDEX idx_budgets_active ON budgets(is_active);
```

### 7. productivity_logs (Produktivlik Jurnali)
```sql
CREATE TABLE productivity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    tasks_completed INTEGER DEFAULT 0,
    tasks_total INTEGER DEFAULT 0,
    habits_completed INTEGER DEFAULT 0,
    habits_total INTEGER DEFAULT 0,
    focus_time_minutes INTEGER DEFAULT 0,
    energy_level INTEGER DEFAULT 5, -- 1-10
    mood VARCHAR(50), -- 'great', 'good', 'ok', 'bad', 'terrible'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, log_date)
);

CREATE INDEX idx_productivity_logs_user_id ON productivity_logs(user_id);
CREATE INDEX idx_productivity_logs_date ON productivity_logs(log_date);
```

### 8. notes (Eslatmalar)
```sql
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    note_date DATE NOT NULL,
    content TEXT NOT NULL,
    tags TEXT[], -- Array of tags
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_date ON notes(note_date);
CREATE INDEX idx_notes_pinned ON notes(is_pinned);
```

### 9. categories (Kategoriyalar - Umumiy)
```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE, -- NULL = default categories
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'task', 'habit', 'transaction'
    color VARCHAR(50),
    icon VARCHAR(50),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(type);
```

---

## Triggerlar (Auto Update)

```sql
-- Updated_at avtomatik yangilanish
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habits_updated_at BEFORE UPDATE ON habits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productivity_logs_updated_at BEFORE UPDATE ON productivity_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Viewlar (Ko'rinishlar)

### 1. Daily Summary View
```sql
CREATE VIEW daily_summary AS
SELECT 
    u.id as user_id,
    CURRENT_DATE as summary_date,
    COUNT(DISTINCT t.id) FILTER (WHERE t.status = 'done') as tasks_completed,
    COUNT(DISTINCT t.id) as tasks_total,
    COUNT(DISTINCT hc.habit_id) as habits_completed,
    COUNT(DISTINCT h.id) FILTER (WHERE h.is_active = TRUE) as habits_total,
    COALESCE(SUM(CASE WHEN tr.transaction_type = 'income' THEN tr.amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN tr.transaction_type = 'expense' THEN ABS(tr.amount) ELSE 0 END), 0) as total_expense
FROM users u
LEFT JOIN tasks t ON t.user_id = u.id AND DATE(t.created_at) = CURRENT_DATE
LEFT JOIN habits h ON h.user_id = u.id AND h.is_active = TRUE
LEFT JOIN habit_completions hc ON hc.habit_id = h.id AND hc.completion_date = CURRENT_DATE
LEFT JOIN transactions tr ON tr.user_id = u.id AND tr.transaction_date = CURRENT_DATE
GROUP BY u.id;
```

---

## Dastlabki Ma'lumotlar (Seed Data)

```sql
-- Default kategoriyalar
INSERT INTO categories (name, type, color, icon, is_default) VALUES
('Ish', 'task', 'indigo', 'Briefcase', TRUE),
('Shaxsiy', 'task', 'blue', 'User', TRUE),
('O\'qish', 'task', 'orange', 'BookOpen', TRUE),
('Oziq-ovqat', 'transaction', 'orange', 'ShoppingBag', TRUE),
('Transport', 'transaction', 'blue', 'Car', TRUE),
('Maosh', 'transaction', 'emerald', 'CreditCard', TRUE),
('Salomatlik', 'habit', 'green', 'Heart', TRUE),
('Sport', 'habit', 'red', 'Dumbbell', TRUE);
```

---

## Migratsiya Fayllari

### migrations/001_initial_schema.sql
Yuqoridagi barcha jadvallar, triggerlar va viewlar

### migrations/002_seed_default_data.sql
Dastlabki ma'lumotlar

---

## Eslatmalar

1. **UUID** ishlatilgan - katta miqyosda ishlash uchun
2. **CASCADE DELETE** - foydalanuvchi o'chirilganda barcha ma'lumotlar o'chadi
3. **Indexlar** - tez qidiruv uchun
4. **Triggerlar** - updated_at avtomatik yangilanish
5. **Viewlar** - murakkab so'rovlar uchun
6. **Timezone** - foydalanuvchi vaqt mintaqasi saqlanadi

