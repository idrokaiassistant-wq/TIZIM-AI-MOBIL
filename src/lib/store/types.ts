import type { Task, Habit, Transaction, User } from '../api/types';

// API types bilan moslashtirilgan interface'lar
export interface TaskLocal {
    id: string;
    title: string;
    time: string;
    date: string;
    cat: string;
    color: string;
    status: 'pending' | 'done';
    isFocus: boolean;
    priority?: 'low' | 'medium' | 'high';
    description?: string;
    due_date?: string;
}

export interface HabitLocal {
    id: string;
    title: string;
    goal: string;
    progress: number;
    streak: number;
    longestStreak: number;
    totalCompletions: number;
    completed: boolean;
    icon: string;
    color: string;
    bg: string;
    cat?: string;
}

export interface TransactionLocal {
    id: string;
    title: string;
    cat: string;
    amount: number;
    date: string;
    type: 'income' | 'expense';
    icon: string;
    color: string;
}

export interface LoadingState {
    tasks: boolean;
    habits: boolean;
    transactions: boolean;
    auth: boolean;
}
