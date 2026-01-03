import { apiClient } from './client';
import type { Budget, BudgetStatus } from './types';

export const budgetsApi = {
  async getAll(params?: {
    skip?: number;
    limit?: number;
    is_active?: boolean;
    period?: string;
  }): Promise<Budget[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.period) queryParams.append('period', params.period);
    
    const url = `/api/budgets${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.instance.get<Budget[]>(url);
    return response.data;
  },

  async getById(budgetId: string): Promise<Budget> {
    const response = await apiClient.instance.get<Budget>(`/api/budgets/${budgetId}`);
    return response.data;
  },

  async create(budget: Partial<Budget>): Promise<Budget> {
    const response = await apiClient.instance.post<Budget>('/api/budgets', budget);
    return response.data;
  },

  async update(budgetId: string, budget: Partial<Budget>): Promise<Budget> {
    const response = await apiClient.instance.put<Budget>(`/api/budgets/${budgetId}`, budget);
    return response.data;
  },

  async delete(budgetId: string): Promise<void> {
    await apiClient.instance.delete(`/api/budgets/${budgetId}`);
  },

  async getStatus(budgetId: string): Promise<BudgetStatus> {
    const response = await apiClient.instance.get<BudgetStatus>(`/api/budgets/${budgetId}/status`);
    return response.data;
  },
};


