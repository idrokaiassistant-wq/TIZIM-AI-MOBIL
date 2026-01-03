import { apiClient } from './client';

export interface HealthResponse {
  status: string;
  timestamp: string;
  services: {
    api: {
      status: string;
      uptime: string;
    };
    database: {
      status: string;
      connected: boolean;
      error?: string;
    };
    ai_service: {
      status: string;
      ml_enabled: boolean;
      nlp_enabled: boolean;
      error?: string;
    };
  };
}

export interface MetricsResponse {
  response_times: {
    by_endpoint: Array<{
      endpoint: string;
      avg_response_time: number;
      request_count: number;
    }>;
    overall_avg: number;
  };
  error_rate: {
    total_requests: number;
    error_count: number;
    error_rate: number;
    success_rate: number;
  };
  active_users: number;
  request_volume: Array<{
    timestamp: string;
    count: number;
  }>;
  database: {
    status: string;
    connected: boolean;
    error?: string;
  };
  ai_service: {
    status: string;
    ml_enabled: boolean;
    nlp_enabled: boolean;
    error?: string;
  };
  timestamp: string;
}

export interface LogEntry {
  id: string;
  level: string;
  message: string;
  timestamp: string;
  user_id: string | null;
  endpoint: string | null;
  method: string | null;
  status_code: number | null;
  response_time: number | null;
  error_details: string | null;
  ip_address: string | null;
}

export interface LogsResponse {
  logs: LogEntry[];
  total: number;
  page: number;
  page_size: number;
}

export interface ServiceStatusResponse {
  api: {
    status: string;
    error_rate: number;
    avg_response_time: number;
    active_users_1h: number;
  };
  database: {
    status: string;
    connected: boolean;
    error?: string;
  };
  ai_service: {
    status: string;
    ml_enabled: boolean;
    nlp_enabled: boolean;
    error?: string;
  };
  timestamp: string;
}

export interface RailwayStatusResponse {
  status: string;
  message?: string;
  service?: string;
  state?: string;
  created_at?: string;
  logs_available: boolean;
  logs_count: number;
  timestamp: string;
}

export const adminApi = {
  async getHealth(): Promise<HealthResponse> {
    const response = await apiClient.instance.get<HealthResponse>('/api/admin/health');
    return response.data;
  },

  async getMetrics(hours: number = 24): Promise<MetricsResponse> {
    const response = await apiClient.instance.get<MetricsResponse>('/api/admin/metrics', {
      params: { hours },
    });
    return response.data;
  },

  async getLogs(params: {
    page?: number;
    page_size?: number;
    level?: string;
    endpoint?: string;
    search?: string;
    hours?: number;
  }): Promise<LogsResponse> {
    const response = await apiClient.instance.get<LogsResponse>('/api/admin/logs', {
      params,
    });
    return response.data;
  },

  async getServicesStatus(): Promise<ServiceStatusResponse> {
    const response = await apiClient.instance.get<ServiceStatusResponse>('/api/admin/services');
    return response.data;
  },

  async getRailwayStatus(): Promise<RailwayStatusResponse> {
    const response = await apiClient.instance.get<RailwayStatusResponse>('/api/admin/railway');
    return response.data;
  },
};


