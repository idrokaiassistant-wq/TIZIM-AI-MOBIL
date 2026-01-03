import { apiClient } from './client';

export interface ActivityData {
    date: string;
    tasks: number;
    habits: number;
    transactions: number;
}

export const analyticsApi = {
    async getActivity(startDate?: string, endDate?: string): Promise<ActivityData[]> {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);

        try {
            const response = await apiClient.instance.get<ActivityData[]>(
                `/api/analytics/activity?${params.toString()}`
            );
            return response.data;
        } catch (error) {
            // Fallback to empty data if API fails
            console.error('Failed to fetch activity data:', error);
            return [];
        }
    },
};

