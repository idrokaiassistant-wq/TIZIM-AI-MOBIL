// API Types

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  timezone: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  priority: string; // low, medium, high
  status: string; // pending, in_progress, done, cancelled
  is_focus: boolean;
  due_date?: string;
  start_time?: string;
  end_time?: string;
  color: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  goal: string;
  category?: string;
  icon: string;
  color: string;
  bg_color: string;
  current_streak: number;
  longest_streak: number;
  total_completions: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitCompletion {
  id: string;
  habit_id: string;
  completion_date: string;
  progress: number;
  notes?: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  amount: number;
  transaction_type: string; // 'income', 'expense'
  transaction_date: string;
  icon: string;
  color: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionStats {
  total_income: number;
  total_expense: number;
  balance: number;
  income_count: number;
  expense_count: number;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  amount: number;
  period: string; // 'daily', 'weekly', 'monthly', 'yearly'
  start_date: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetStatus {
  budget_id: string;
  category: string;
  budget_amount: number;
  spent_amount: number;
  remaining_amount: number;
  percentage_used: number;
  is_over_budget: boolean;
}

export interface ProductivityLog {
  id: string;
  user_id: string;
  log_date: string;
  tasks_completed: number;
  tasks_total: number;
  habits_completed: number;
  habits_total: number;
  focus_time_minutes: number;
  energy_level: number;
  mood?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductivityStats {
  total_tasks_completed: number;
  total_tasks: number;
  total_habits_completed: number;
  total_habits: number;
  total_focus_time_minutes: number;
  average_energy_level: number;
  average_tasks_completion_rate: number;
  average_habits_completion_rate: number;
}

// Request/Response types
export interface LoginRequest {
  username: string; // email
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface ApiError {
  detail: string;
}
