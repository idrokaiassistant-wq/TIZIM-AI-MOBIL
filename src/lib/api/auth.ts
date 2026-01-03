import { apiClient } from './client';
import type { LoginRequest, RegisterRequest, TokenResponse, User } from './types';

export const authApi = {
  async register(data: RegisterRequest): Promise<User> {
    const response = await apiClient.instance.post<User>('/api/auth/register', data);
    return response.data;
  },

  async login(data: LoginRequest): Promise<TokenResponse> {
    const formData = new FormData();
    formData.append('username', data.username);
    formData.append('password', data.password);
    
    const response = await apiClient.instance.post<TokenResponse>(
      '/api/auth/login',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    // Store token
    if (response.data.access_token) {
      apiClient.setAuthToken(response.data.access_token);
    }
    
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.instance.get<User>('/api/auth/me');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.instance.put<User>('/api/auth/profile', data);
    return response.data;
  },

  logout() {
    apiClient.clearAuthToken();
  },

  async sendTelegramCode(phoneNumber: string): Promise<{ message: string; expires_in_minutes: number }> {
    const response = await apiClient.instance.post<{ message: string; expires_in_minutes: number }>(
      '/api/auth/telegram/send-code',
      { phone_number: phoneNumber }
    );
    return response.data;
  },

  async verifyTelegramCode(phoneNumber: string, code: string): Promise<TokenResponse & { user: User }> {
    const response = await apiClient.instance.post<TokenResponse & { user: User }>(
      '/api/auth/telegram/verify-code',
      { phone_number: phoneNumber, code }
    );
    
    // Store token
    if (response.data.access_token) {
      apiClient.setAuthToken(response.data.access_token);
    }
    
    return response.data;
  },
};

