import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, tasksApi, habitsApi, transactionsApi } from './api';
import type { Task, Habit, Transaction, User, ApiError } from './api/types';

// API types bilan moslashtirilgan interface'lar
export interface TaskLocal {
    id: string;
    title: string;
    time: string;
    cat: string;
    color: string;
    status: 'pending' | 'done';
    isFocus: boolean;
}

export interface HabitLocal {
    id: string;
    title: string;
    goal: string;
    progress: number;
    streak: number;
    completed: boolean;
    icon: string;
    color: string;
    bg: string;
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

interface TizimState {
    // Data
    tasks: TaskLocal[];
    habits: HabitLocal[];
    transactions: TransactionLocal[];
    user: User | null;
    
    // Loading states
    loading: {
        tasks: boolean;
        habits: boolean;
        transactions: boolean;
        auth: boolean;
    };
    
    // Error states
    error: string | null;
    
    // Auth actions
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, fullName?: string) => Promise<void>;
    logout: () => void;
    fetchUser: () => Promise<void>;
    
    // Task actions
    fetchTasks: () => Promise<void>;
    addTask: (task: Partial<TaskLocal>) => Promise<void>;
    updateTask: (id: string, task: Partial<TaskLocal>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    toggleTask: (id: string) => Promise<void>;
    
    // Habit actions
    fetchHabits: () => Promise<void>;
    addHabit: (habit: Partial<HabitLocal>) => Promise<void>;
    updateHabit: (id: string, habit: Partial<HabitLocal>) => Promise<void>;
    deleteHabit: (id: string) => Promise<void>;
    toggleHabit: (id: string) => Promise<void>;
    
    // Transaction actions
    fetchTransactions: () => Promise<void>;
    addTransaction: (transaction: Partial<TransactionLocal>) => Promise<void>;
    updateTransaction: (id: string, transaction: Partial<TransactionLocal>) => Promise<void>;
    deleteTransaction: (id: string) => Promise<void>;
    
    // Helper functions
    _mapTaskFromAPI: (task: Task) => TaskLocal;
    _mapTaskToAPI: (task: TaskLocal) => Partial<Task>;
    _mapHabitFromAPI: (habit: Habit) => HabitLocal;
    _mapHabitToAPI: (habit: HabitLocal) => Partial<Habit>;
    _mapTransactionFromAPI: (transaction: Transaction) => TransactionLocal;
    _mapTransactionToAPI: (transaction: TransactionLocal) => Partial<Transaction>;
}

// Helper functions for mapping
const mapTaskFromAPI = (task: Task): TaskLocal => {
    const time = task.start_time && task.end_time 
        ? `${task.start_time} - ${task.end_time}`
        : task.start_time || '';
    
    return {
        id: task.id,
        title: task.title,
        time,
        cat: task.category,
        color: task.color,
        status: task.status === 'done' ? 'done' : 'pending',
        isFocus: task.is_focus,
    };
};

const mapTaskToAPI = (task: TaskLocal): Partial<Task> => {
    const [startTime, endTime] = task.time.includes(' - ') 
        ? task.time.split(' - ')
        : [task.time, null];
    
    return {
        title: task.title,
        category: task.cat,
        color: task.color,
        status: task.status,
        is_focus: task.isFocus,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
    };
};

const mapHabitFromAPI = (habit: Habit): HabitLocal => {
    return {
        id: habit.id,
        title: habit.title,
        goal: habit.goal,
        progress: 0, // Will be calculated from completions
        streak: habit.current_streak,
        completed: false, // Will be checked from today's completion
        icon: habit.icon,
        color: habit.color,
        bg: habit.bg_color,
    };
};

const mapHabitToAPI = (habit: HabitLocal): Partial<Habit> => {
    return {
        title: habit.title,
        goal: habit.goal,
        icon: habit.icon,
        color: habit.color,
        bg_color: habit.bg,
    };
};

const mapTransactionFromAPI = (transaction: Transaction): TransactionLocal => {
    return {
        id: transaction.id,
        title: transaction.title,
        cat: transaction.category,
        amount: transaction.amount,
        date: transaction.transaction_date,
        type: transaction.transaction_type as 'income' | 'expense',
        icon: transaction.icon,
        color: transaction.color,
    };
};

const mapTransactionToAPI = (transaction: TransactionLocal): Partial<Transaction> => {
    return {
        title: transaction.title,
        category: transaction.cat,
        amount: transaction.amount,
        transaction_type: transaction.type,
        transaction_date: transaction.date,
        icon: transaction.icon,
        color: transaction.color,
    };
};

export const useStore = create<TizimState>()(
    persist(
        (set, get) => ({
            // Initial state
            tasks: [],
            habits: [],
            transactions: [],
            user: null,
            loading: {
                tasks: false,
                habits: false,
                transactions: false,
                auth: false,
            },
            error: null,

            // Auth actions
            login: async (email: string, password: string) => {
                set({ loading: { ...get().loading, auth: true }, error: null });
                try {
                    await authApi.login({ username: email, password });
                    await get().fetchUser();
                } catch (error) {
                    const apiError = error as ApiError;
                    set({ error: apiError.detail || 'Login failed', loading: { ...get().loading, auth: false } });
                    throw error;
                }
                set({ loading: { ...get().loading, auth: false } });
            },

            register: async (email: string, password: string, fullName?: string) => {
                set({ loading: { ...get().loading, auth: true }, error: null });
                try {
                    await authApi.register({ email, password, full_name: fullName });
                    await get().login(email, password);
                } catch (error) {
                    const apiError = error as ApiError;
                    set({ error: apiError.detail || 'Registration failed', loading: { ...get().loading, auth: false } });
                    throw error;
                }
            },

            logout: () => {
                authApi.logout();
                set({ user: null, tasks: [], habits: [], transactions: [] });
            },

            fetchUser: async () => {
                try {
                    const user = await authApi.getMe();
                    set({ user });
                } catch {
                    // User not authenticated
                    set({ user: null });
                }
            },

            // Task actions
            fetchTasks: async () => {
                set({ loading: { ...get().loading, tasks: true }, error: null });
                try {
                    const tasks = await tasksApi.getAll();
                    set({ 
                        tasks: tasks.map(mapTaskFromAPI),
                        loading: { ...get().loading, tasks: false }
                    });
                } catch (error) {
                    const apiError = error as ApiError;
                    set({ 
                        error: apiError.detail || 'Failed to fetch tasks',
                        loading: { ...get().loading, tasks: false }
                    });
                }
            },

            addTask: async (task: Partial<TaskLocal>) => {
                set({ error: null });
                try {
                    const newTask = await tasksApi.create(mapTaskToAPI(task as TaskLocal));
                    set({ tasks: [mapTaskFromAPI(newTask), ...get().tasks] });
                } catch (error) {
                    const apiError = error as ApiError;
                    set({ error: apiError.detail || 'Failed to create task' });
                    throw error;
                }
            },

            updateTask: async (id: string, task: Partial<TaskLocal>) => {
                set({ error: null });
                try {
                    const updatedTask = await tasksApi.update(id, mapTaskToAPI(task as TaskLocal));
                    set({ 
                        tasks: get().tasks.map(t => t.id === id ? mapTaskFromAPI(updatedTask) : t)
                    });
                } catch (error) {
                    const apiError = error as ApiError;
                    set({ error: apiError.detail || 'Failed to update task' });
                    throw error;
                }
            },

            deleteTask: async (id: string) => {
                set({ error: null });
                try {
                    await tasksApi.delete(id);
                    set({ tasks: get().tasks.filter(t => t.id !== id) });
                } catch (error) {
                    const apiError = error as ApiError;
                    set({ error: apiError.detail || 'Failed to delete task' });
                    throw error;
                }
            },

            toggleTask: async (id: string) => {
                set({ error: null });
                try {
                    const updatedTask = await tasksApi.toggle(id);
                    set({ 
                        tasks: get().tasks.map(t => t.id === id ? mapTaskFromAPI(updatedTask) : t)
                    });
                } catch (error) {
                    const apiError = error as ApiError;
                    set({ error: apiError.detail || 'Failed to toggle task' });
                    throw error;
                }
            },

            // Habit actions
            fetchHabits: async () => {
                set({ loading: { ...get().loading, habits: true }, error: null });
                try {
                    const habits = await habitsApi.getAll();
                    set({ 
                        habits: habits.map(mapHabitFromAPI),
                        loading: { ...get().loading, habits: false }
                    });
                } catch (error) {
                    const apiError = error as ApiError;
                    set({ 
                        error: apiError.detail || 'Failed to fetch habits',
                        loading: { ...get().loading, habits: false }
                    });
                }
            },

            addHabit: async (habit: Partial<HabitLocal>) => {
                set({ error: null });
                try {
                    const newHabit = await habitsApi.create(mapHabitToAPI(habit as HabitLocal));
                    set({ habits: [mapHabitFromAPI(newHabit), ...get().habits] });
                } catch (error) {
                    const apiError = error as ApiError;
                    set({ error: apiError.detail || 'Failed to create habit' });
                    throw error;
                }
            },

            updateHabit: async (id: string, habit: Partial<HabitLocal>) => {
                set({ error: null });
                try {
                    const updatedHabit = await habitsApi.update(id, mapHabitToAPI(habit as HabitLocal));
                    set({ 
                        habits: get().habits.map(h => h.id === id ? mapHabitFromAPI(updatedHabit) : h)
                    });
                } catch (error) {
                    const apiError = error as ApiError;
                    set({ error: apiError.detail || 'Failed to update habit' });
                    throw error;
                }
            },

            deleteHabit: async (id: string) => {
                set({ error: null });
                try {
                    await habitsApi.delete(id);
                    set({ habits: get().habits.filter(h => h.id !== id) });
                } catch (error) {
                    const apiError = error as ApiError;
                    set({ error: apiError.detail || 'Failed to delete habit' });
                    throw error;
                }
            },

            toggleHabit: async (id: string) => {
                set({ error: null });
                try {
                    const today = new Date().toISOString().split('T')[0];
                    await habitsApi.complete(id, today, 100);
                    // Refresh habits to get updated stats
                    await get().fetchHabits();
                } catch (error) {
                    const apiError = error as ApiError;
                    set({ error: apiError.detail || 'Failed to toggle habit' });
                    throw error;
                }
            },

            // Transaction actions
            fetchTransactions: async () => {
                set({ loading: { ...get().loading, transactions: true }, error: null });
                try {
                    const transactions = await transactionsApi.getAll();
                    set({ 
                        transactions: transactions.map(mapTransactionFromAPI),
                        loading: { ...get().loading, transactions: false }
                    });
                } catch (error) {
                    const apiError = error as ApiError;
                    set({ 
                        error: apiError.detail || 'Failed to fetch transactions',
                        loading: { ...get().loading, transactions: false }
                    });
                }
            },

            addTransaction: async (transaction: Partial<TransactionLocal>) => {
                set({ error: null });
                try {
                    const newTransaction = await transactionsApi.create(mapTransactionToAPI(transaction as TransactionLocal));
                    set({ transactions: [mapTransactionFromAPI(newTransaction), ...get().transactions] });
                } catch (error) {
                    const apiError = error as ApiError;
                    set({ error: apiError.detail || 'Failed to create transaction' });
                    throw error;
                }
            },

            updateTransaction: async (id: string, transaction: Partial<TransactionLocal>) => {
                set({ error: null });
                try {
                    const updatedTransaction = await transactionsApi.update(id, mapTransactionToAPI(transaction as TransactionLocal));
                    set({ 
                        transactions: get().transactions.map(t => t.id === id ? mapTransactionFromAPI(updatedTransaction) : t)
                    });
                } catch (error) {
                    const apiError = error as ApiError;
                    set({ error: apiError.detail || 'Failed to update transaction' });
                    throw error;
                }
            },

            deleteTransaction: async (id: string) => {
                set({ error: null });
                try {
                    await transactionsApi.delete(id);
                    set({ transactions: get().transactions.filter(t => t.id !== id) });
                } catch (error) {
                    const apiError = error as ApiError;
                    set({ error: apiError.detail || 'Failed to delete transaction' });
                    throw error;
                }
            },

            // Helper functions (exposed for compatibility)
            _mapTaskFromAPI: mapTaskFromAPI,
            _mapTaskToAPI: mapTaskToAPI,
            _mapHabitFromAPI: mapHabitFromAPI,
            _mapHabitToAPI: mapHabitToAPI,
            _mapTransactionFromAPI: mapTransactionFromAPI,
            _mapTransactionToAPI: mapTransactionToAPI,
        }),
        { 
            name: 'tizim-ai-storage',
            partialize: (state) => ({
                user: state.user,
                // Don't persist tasks, habits, transactions - fetch from API
            })
        }
    )
);
