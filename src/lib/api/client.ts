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

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        if (error.response) {
          // Server responded with error
          const apiError: ApiError = {
            detail: error.response.data?.detail || error.message || 'An error occurred',
          };
          return Promise.reject(apiError);
        } else if (error.request) {
          // Request made but no response
          const apiError: ApiError = {
            detail: 'Network error. Please check your connection.',
          };
          return Promise.reject(apiError);
        } else {
          // Something else happened
          const apiError: ApiError = {
            detail: error.message || 'An unexpected error occurred',
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

