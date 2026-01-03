import type { Task, Habit, Transaction } from '../api/types';
import type { TaskLocal, HabitLocal, TransactionLocal } from './types';

export const mapTaskFromAPI = (task: Task): TaskLocal => {
    const time = task.start_time && task.end_time
        ? `${task.start_time} - ${task.end_time}`
        : task.start_time || '';

    return {
        id: task.id,
        title: task.title,
        time,
        date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        cat: task.category,
        color: task.color,
        status: task.status === 'done' ? 'done' : 'pending',
        isFocus: task.is_focus,
        priority: task.priority as 'low' | 'medium' | 'high' | undefined,
        description: task.description,
        due_date: task.due_date,
    };
};

export const mapTaskToAPI = (task: TaskLocal): Partial<Task> => {
    const [startTime, endTime] = task.time.includes(' - ')
        ? task.time.split(' - ')
        : [task.time, null];

    return {
        title: task.title,
        description: task.description,
        category: task.cat,
        priority: task.priority,
        color: task.color,
        status: task.status,
        is_focus: task.isFocus,
        due_date: task.due_date || task.date,
        start_time: startTime || undefined,
        end_time: endTime || undefined,
    };
};

export const mapHabitFromAPI = (habit: Habit): HabitLocal => {
    return {
        id: habit.id,
        title: habit.title,
        goal: habit.goal,
        progress: 0,
        streak: habit.current_streak,
        longestStreak: habit.longest_streak,
        totalCompletions: habit.total_completions,
        completed: false,
        icon: habit.icon,
        color: habit.color,
        bg: habit.bg_color,
        cat: habit.category,
    };
};

export const mapHabitToAPI = (habit: HabitLocal): Partial<Habit> => {
    return {
        title: habit.title,
        goal: habit.goal,
        icon: habit.icon,
        color: habit.color,
        bg_color: habit.bg,
    };
};

export const mapTransactionFromAPI = (transaction: Transaction): TransactionLocal => {
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

export const mapTransactionToAPI = (transaction: TransactionLocal): Partial<Transaction> => {
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
