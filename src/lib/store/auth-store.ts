import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api';
import type { User, ApiError } from '../api/types';

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, fullName?: string) => Promise<void>;
    logout: () => void;
    fetchUser: () => Promise<void>;
    loginWithTelegram: (phoneNumber: string, code: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            loading: false,
            error: null,

            login: async (email: string, password: string) => {
                set({ loading: true, error: null });
                try {
                    await authApi.login({ username: email, password });
                    await get().fetchUser();
                } catch (error) {
                    const apiError = error as ApiError;
                    set({ error: apiError.detail || 'Login failed', loading: false });
                    throw error;
                }
                set({ loading: false });
            },

            register: async (email: string, password: string, fullName?: string) => {
                set({ loading: true, error: null });
                try {
                    await authApi.register({ email, password, full_name: fullName });
                    await get().login(email, password);
                } catch (error) {
                    const apiError = error as ApiError;
                    set({ error: apiError.detail || 'Registration failed', loading: false });
                    throw error;
                }
            },

            logout: () => {
                authApi.logout();
                set({ user: null });
            },

            fetchUser: async () => {
                // Check if token exists before making request
                const token = localStorage.getItem('access_token');
                if (!token) {
                    set({ user: null });
                    return;
                }
                
                try {
                    const user = await authApi.getMe();
                    set({ user });
                } catch {
                    set({ user: null });
                }
            },

            loginWithTelegram: async (phoneNumber: string, code: string) => {
                set({ loading: true, error: null });
                try {
                    const response = await authApi.verifyTelegramCode(phoneNumber, code);
                    await get().fetchUser();
                } catch (error) {
                    const apiError = error as ApiError;
                    set({ error: apiError.detail || 'Telegram login failed', loading: false });
                    throw error;
                }
                set({ loading: false });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user }),
        }
    )
);
