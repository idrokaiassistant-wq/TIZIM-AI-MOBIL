import { create } from 'zustand';
import { habitsApi } from '../api';
import type { ApiError } from '../api/types';
import type { HabitLocal } from './types';
import { mapHabitFromAPI, mapHabitToAPI } from './mappers';

interface HabitsState {
    habits: HabitLocal[];
    loading: boolean;
    error: string | null;
    fetchHabits: (filters?: { search?: string; category?: string }) => Promise<void>;
    addHabit: (habit: Partial<HabitLocal>) => Promise<void>;
    updateHabit: (id: string, habit: Partial<HabitLocal>) => Promise<void>;
    deleteHabit: (id: string) => Promise<void>;
    toggleHabit: (id: string) => Promise<void>;
}

export const useHabitsStore = create<HabitsState>()((set, get) => ({
    habits: [],
    loading: false,
    error: null,

    fetchHabits: async (filters?: { search?: string; category?: string }) => {
        set({ loading: true, error: null });
        try {
            const apiFilters: { search?: string; category?: string } = {};
            if (filters?.search) apiFilters.search = filters.search;
            if (filters?.category && filters.category !== 'Barchasi') {
                apiFilters.category = filters.category;
            }
            const habits = await habitsApi.getAll(apiFilters);
            set({
                habits: habits.map(mapHabitFromAPI),
                loading: false
            });
        } catch (error) {
            const apiError = error as ApiError;
            set({
                error: apiError.detail || 'Failed to fetch habits',
                loading: false
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
            await get().fetchHabits();
        } catch (error) {
            const apiError = error as ApiError;
            set({ error: apiError.detail || 'Failed to toggle habit' });
            throw error;
        }
    },
}));
