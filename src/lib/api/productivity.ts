import { apiClient } from './client';
import type { ProductivityLog, ProductivityStats } from './types';

export const productivityApi = {
  async getAllLogs(params?: {
    skip?: number;
    limit?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<ProductivityLog[]> {
    const queryParams = new URLSearchParams();
    if (params?.skip !== undefined) queryParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    const url = `/api/productivity/logs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.instance.get<ProductivityLog[]>(url);
    return response.data;
  },

  async getLogById(logId: string): Promise<ProductivityLog> {
    const response = await apiClient.instance.get<ProductivityLog>(`/api/productivity/logs/${logId}`);
    return response.data;
  },

  async createLog(log: Partial<ProductivityLog>): Promise<ProductivityLog> {
    const response = await apiClient.instance.post<ProductivityLog>('/api/productivity/logs', log);
    return response.data;
  },

  async updateLog(logId: string, log: Partial<ProductivityLog>): Promise<ProductivityLog> {
    const response = await apiClient.instance.put<ProductivityLog>(`/api/productivity/logs/${logId}`, log);
    return response.data;
  },

  async deleteLog(logId: string): Promise<void> {
    await apiClient.instance.delete(`/api/productivity/logs/${logId}`);
  },

  async getStats(params?: {
    start_date?: string;
    end_date?: string;
  }): Promise<ProductivityStats> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    
    const url = `/api/productivity/stats${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiClient.instance.get<ProductivityStats>(url);
    return response.data;
  },
};


