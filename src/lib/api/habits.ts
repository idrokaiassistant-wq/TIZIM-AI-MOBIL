import { apiClient } from './client';
import type { Habit, HabitCompletion } from './types';

export interface HabitFilters {
  skip?: number;
  limit?: number;
  is_active?: boolean;
  category?: string;
  search?: string;
}

export const habitsApi = {
  async getAll(filters: HabitFilters = {}): Promise<Habit[]> {
    const params = new URLSearchParams();
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.is_active !== undefined) params.append('is_active', filters.is_active.toString());
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);

    const response = await apiClient.instance.get<Habit[]>(`/api/habits?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<Habit> {
    const response = await apiClient.instance.get<Habit>(`/api/habits/${id}`);
    return response.data;
  },

  async create(data: Partial<Habit>): Promise<Habit> {
    const response = await apiClient.instance.post<Habit>('/api/habits', data);
    return response.data;
  },

  async update(id: string, data: Partial<Habit>): Promise<Habit> {
    const response = await apiClient.instance.put<Habit>(`/api/habits/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.instance.delete(`/api/habits/${id}`);
  },

  async complete(id: string, completionDate: string, progress: number = 100, notes?: string): Promise<HabitCompletion> {
    const response = await apiClient.instance.post<HabitCompletion>(`/api/habits/${id}/complete`, {
      completion_date: completionDate,
      progress,
      notes,
    });
    return response.data;
  },

  async getCompletions(id: string, skip: number = 0, limit: number = 100): Promise<HabitCompletion[]> {
    const params = new URLSearchParams();
    params.append('skip', skip.toString());
    params.append('limit', limit.toString());

    const response = await apiClient.instance.get<HabitCompletion[]>(
      `/api/habits/${id}/completions?${params.toString()}`
    );
    return response.data;
  },
};

