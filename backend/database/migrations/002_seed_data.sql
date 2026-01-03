-- Migration 002: Seed Default Data
-- Default kategoriyalar

INSERT OR IGNORE INTO categories (id, name, type, color, icon, is_default) VALUES
('cat_task_ish', 'Ish', 'task', 'indigo', 'Briefcase', 1),
('cat_task_shaxsiy', 'Shaxsiy', 'task', 'blue', 'User', 1),
('cat_task_oqish', 'O''qish', 'task', 'orange', 'BookOpen', 1),
('cat_trans_oziq', 'Oziq-ovqat', 'transaction', 'orange', 'ShoppingBag', 1),
('cat_trans_transport', 'Transport', 'transaction', 'blue', 'Car', 1),
('cat_trans_maosh', 'Maosh', 'transaction', 'emerald', 'CreditCard', 1),
('cat_habit_salomatlik', 'Salomatlik', 'habit', 'green', 'Heart', 1),
('cat_habit_sport', 'Sport', 'habit', 'red', 'Dumbbell', 1);

