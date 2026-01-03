import { apiClient } from './client';
import type { Transaction, TransactionStats } from './types';

export interface TransactionFilters {
  skip?: number;
  limit?: number;
  transaction_type?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export const transactionsApi = {
  async getAll(filters: TransactionFilters = {}): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filters.skip !== undefined) params.append('skip', filters.skip.toString());
    if (filters.limit !== undefined) params.append('limit', filters.limit.toString());
    if (filters.transaction_type) params.append('transaction_type', filters.transaction_type);
    if (filters.category) params.append('category', filters.category);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.search) params.append('search', filters.search);

    const response = await apiClient.instance.get<Transaction[]>(
      `/api/transactions?${params.toString()}`
    );
    return response.data;
  },

  async getById(id: string): Promise<Transaction> {
    const response = await apiClient.instance.get<Transaction>(`/api/transactions/${id}`);
    return response.data;
  },

  async create(data: Partial<Transaction>): Promise<Transaction> {
    const response = await apiClient.instance.post<Transaction>('/api/transactions', data);
    return response.data;
  },

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    const response = await apiClient.instance.put<Transaction>(`/api/transactions/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.instance.delete(`/api/transactions/${id}`);
  },

  async getStats(startDate?: string, endDate?: string): Promise<TransactionStats> {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await apiClient.instance.get<TransactionStats>(
      `/api/transactions/stats/summary?${params.toString()}`
    );
    return response.data;
  },

  async scanReceipt(imageFile: File): Promise<Transaction> {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await apiClient.instance.post<Transaction>(
      '/api/transactions/scan-receipt',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};

