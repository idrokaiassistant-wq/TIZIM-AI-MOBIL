import { adminApi } from './admin';
import type { MetricsResponse, ServiceStatusResponse } from './admin';

export class MonitoringService {
  private updateInterval: number = 10000; // 10 seconds
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private subscribers: Set<(data: MetricsResponse | ServiceStatusResponse) => void> = new Set();

  startPolling(updateInterval: number = 10000) {
    this.updateInterval = updateInterval;
    this.stopPolling(); // Clear any existing interval

    // Initial fetch
    this.fetchMetrics();

    // Set up polling
    this.intervalId = setInterval(() => {
      this.fetchMetrics();
    }, this.updateInterval);
  }

  stopPolling() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  subscribe(callback: (data: MetricsResponse | ServiceStatusResponse) => void) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  private async fetchMetrics() {
    try {
      const [metrics, services] = await Promise.all([
        adminApi.getMetrics(24),
        adminApi.getServicesStatus(),
      ]);

      // Notify all subscribers
      this.subscribers.forEach((callback) => {
        try {
          callback(metrics);
          callback(services);
        } catch (error) {
          console.error('Error in monitoring subscriber:', error);
        }
      });
    } catch (error) {
      console.error('Error fetching monitoring data:', error);
    }
  }

  async getMetricsOnce(hours: number = 24): Promise<MetricsResponse> {
    return adminApi.getMetrics(hours);
  }

  async getServicesStatusOnce(): Promise<ServiceStatusResponse> {
    return adminApi.getServicesStatus();
  }
}

export const monitoringService = new MonitoringService();

