import { create } from 'zustand';
import { notificationsApi } from '../api/notifications';
import type { ApiError } from '../api/types';

interface NotificationsState {
    deviceToken: string | null;
    permissionGranted: boolean;
    registered: boolean;
    registerDevice: (token: string, platform?: string) => Promise<void>;
    requestPermission: () => Promise<boolean>;
}

export const useNotificationsStore = create<NotificationsState>()((set, get) => ({
    deviceToken: null,
    permissionGranted: false,
    registered: false,

    requestPermission: async () => {
        try {
            // Check if we're on web platform
            if (typeof window !== 'undefined' && 'Notification' in window) {
                // Use browser Notification API for web
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    set({ permissionGranted: true });
                    return true;
                }
                return false;
            }
            
            // Check if Capacitor Push Notifications is available (for native platforms)
            if (typeof window !== 'undefined' && 'Capacitor' in window) {
                try {
                    const { PushNotifications } = await import('@capacitor/push-notifications');
                    const result = await PushNotifications.requestPermissions();
                    if (result.receive === 'granted') {
                        set({ permissionGranted: true });
                        return true;
                    }
                } catch (capacitorError) {
                    // Capacitor plugin not available (e.g., on web)
                    console.log('Capacitor PushNotifications not available, using browser notifications');
                    // Fallback to browser notifications
                    if ('Notification' in window) {
                        const permission = await Notification.requestPermission();
                        if (permission === 'granted') {
                            set({ permissionGranted: true });
                            return true;
                        }
                    }
                }
            }
            return false;
        } catch (error) {
            console.error('Permission request error:', error);
            return false;
        }
    },

    registerDevice: async (token: string, platform: string = 'web') => {
        try {
            await notificationsApi.registerDevice(token, platform);
            set({ deviceToken: token, registered: true });
        } catch (error) {
            const apiError = error as ApiError;
            console.error('Device registration error:', apiError);
            throw error;
        }
    },
}));

