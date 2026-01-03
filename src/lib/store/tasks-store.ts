import { create } from 'zustand';
import { tasksApi } from '../api';
import type { ApiError } from '../api/types';
import type { TaskLocal } from './types';
import { mapTaskFromAPI, mapTaskToAPI } from './mappers';

interface TasksState {
    tasks: TaskLocal[];
    loading: boolean;
    error: string | null;
    fetchTasks: () => Promise<void>;
    addTask: (task: Partial<TaskLocal>) => Promise<void>;
    updateTask: (id: string, task: Partial<TaskLocal>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    toggleTask: (id: string) => Promise<void>;
}

export const useTasksStore = create<TasksState>()((set, get) => ({
    tasks: [],
    loading: false,
    error: null,

    fetchTasks: async () => {
        set({ loading: true, error: null });
        try {
            const tasks = await tasksApi.getAll();
            set({
                tasks: tasks.map(mapTaskFromAPI),
                loading: false
            });
        } catch (error) {
            const apiError = error as ApiError;
            set({
                error: apiError.detail || 'Failed to fetch tasks',
                loading: false
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
}));
