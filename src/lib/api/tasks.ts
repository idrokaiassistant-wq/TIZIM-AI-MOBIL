import { apiClient } from './client';
import type { Task } from './types';

export interface TaskFilters {
  skip?: number;
  limit?: number;
  status?: string;
  category?: string;
  is_focus?: boolean;
  search?: string;
}

export const tasksApi = {
  async getAll(filters: TaskFilters = {}): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.status) params.append('status', filters.status);
    if (filters.category) params.append('category', filters.category);
    if (filters.is_focus !== undefined) params.append('is_focus', filters.is_focus.toString());
    if (filters.search) params.append('search', filters.search);

    const response = await apiClient.instance.get<Task[]>(`/api/tasks?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<Task> {
    const response = await apiClient.instance.get<Task>(`/api/tasks/${id}`);
    return response.data;
  },

  async create(data: Partial<Task>): Promise<Task> {
    const response = await apiClient.instance.post<Task>('/api/tasks', data);
    return response.data;
  },

  async update(id: string, data: Partial<Task>): Promise<Task> {
    const response = await apiClient.instance.put<Task>(`/api/tasks/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.instance.delete(`/api/tasks/${id}`);
  },

  async toggle(id: string): Promise<Task> {
    const response = await apiClient.instance.patch<Task>(`/api/tasks/${id}/toggle`);
    return response.data;
  },
};

