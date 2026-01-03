import { useEffect } from 'react';
import { useNotificationsStore } from '../../lib/store/notifications-store';

export const NotificationManager: React.FC = () => {
    const { requestPermission, registerDevice, permissionGranted, registered } = useNotificationsStore();

    useEffect(() => {
        const initNotifications = async () => {
            try {
                // Request permission
                const granted = await requestPermission();
                if (!granted) {
                    console.log('Notification permission not granted');
                    return;
                }

                // Check if we're on native platform (Capacitor)
                if (typeof window !== 'undefined' && 'Capacitor' in window) {
                    try {
                        const { PushNotifications } = await import('@capacitor/push-notifications');
                        const { Capacitor } = await import('@capacitor/core');
                        
                        // Only use Capacitor PushNotifications on native platforms
                        if (Capacitor.getPlatform() !== 'web') {
                            // Register for push notifications
                            await PushNotifications.register();

                            // Listen for registration
                            PushNotifications.addListener('registration', (token) => {
                                console.log('Push registration success, token: ' + token.value);
                                registerDevice(token.value, Capacitor.getPlatform());
                            });

                            // Listen for registration errors
                            PushNotifications.addListener('registrationError', (error) => {
                                console.error('Error on registration: ' + JSON.stringify(error));
                            });

                            // Listen for push notifications
                            PushNotifications.addListener('pushNotificationReceived', (notification) => {
                                console.log('Push notification received: ', notification);
                            });

                            // Listen for push notification actions
                            PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
                                console.log('Push notification action performed', notification.actionId, notification.inputValue);
                            });
                        } else {
                            // On web, use browser Notification API
                            console.log('Using browser Notification API for web platform');
                        }
                    } catch (capacitorError) {
                        // Capacitor not available, use browser notifications
                        console.log('Capacitor PushNotifications not available, using browser notifications');
                    }
                } else {
                    // No Capacitor, use browser Notification API
                    console.log('Using browser Notification API');
                }
            } catch (error) {
                console.error('Notification initialization error:', error);
            }
        };

        initNotifications();
    }, [requestPermission, registerDevice]);

    return null; // This component doesn't render anything
};

