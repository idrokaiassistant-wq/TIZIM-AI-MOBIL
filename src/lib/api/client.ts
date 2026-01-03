import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import type { ApiError } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('access_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle errors with retry logic
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean; _retryCount?: number };
        
        // Retry logic for network errors
        if (!error.response && error.request && !config._retry) {
          config._retry = true;
          config._retryCount = (config._retryCount || 0) + 1;
          
          // Retry up to 3 times with exponential backoff
          if (config._retryCount <= 3) {
            const delay = Math.pow(2, config._retryCount) * 1000; // 2s, 4s, 8s
            await new Promise(resolve => setTimeout(resolve, delay));
            return this.client.request(config);
          }
        }

        // Handle timeout
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
          const apiError: ApiError = {
            detail: 'So\'rov vaqti tugadi. Iltimos, qayta urinib ko\'ring.',
          };
          return Promise.reject(apiError);
        }

        if (error.response) {
          // Server responded with error
          const status = error.response.status;
          let detail = error.response.data?.detail || error.message || 'Xatolik yuz berdi';
          
          // User-friendly error messages
          if (status === 401) {
            detail = 'Kirish huquqi yo\'q. Iltimos, qayta kiring.';
            this.clearAuthToken();
            // Don't redirect here to avoid infinite loops
            // Let components handle the redirect
          } else if (status === 403) {
            detail = 'Bu amalni bajarish uchun ruxsat yo\'q.';
          } else if (status === 404) {
            detail = 'Ma\'lumot topilmadi.';
          } else if (status === 429) {
            detail = 'Juda ko\'p so\'rovlar. Iltimos, biroz kutib turing.';
          } else if (status >= 500) {
            detail = 'Server xatosi. Iltimos, keyinroq qayta urinib ko\'ring.';
          }
          
          const apiError: ApiError = {
            detail,
          };
          return Promise.reject(apiError);
        } else if (error.request) {
          // Request made but no response
          const apiError: ApiError = {
            detail: 'Internet aloqasi bilan muammo. Iltimos, internet aloqangizni tekshiring.',
          };
          return Promise.reject(apiError);
        } else {
          // Something else happened
          const apiError: ApiError = {
            detail: error.message || 'Kutilmagan xatolik yuz berdi.',
          };
          return Promise.reject(apiError);
        }
      }
    );
  }

  get instance(): AxiosInstance {
    return this.client;
  }

  setAuthToken(token: string) {
    localStorage.setItem('access_token', token);
  }

  clearAuthToken() {
    localStorage.removeItem('access_token');
  }

  getAuthToken(): string | null {
    return localStorage.getItem('access_token');
  }
}

export const apiClient = new ApiClient();

