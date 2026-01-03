import { apiClient } from './client';

export interface DeviceRegistration {
    device_token: string;
    platform: string;
}

export const notificationsApi = {
    async registerDevice(deviceToken: string, platform: string = 'web'): Promise<void> {
        await apiClient.instance.post('/api/notifications/register-device', {
            device_token: deviceToken,
            platform,
        });
    },
};


