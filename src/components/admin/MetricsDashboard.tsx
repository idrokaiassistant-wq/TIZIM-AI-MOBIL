import { useEffect, useState } from 'react';
import { Card } from '../shared';
import { Activity, TrendingUp, AlertCircle, Clock } from 'lucide-react';
import { adminApi } from '../../lib/api/admin';
import type { MetricsResponse } from '../../lib/api/admin';
import { monitoringService } from '../../lib/api/monitoring';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

export const MetricsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hours, setHours] = useState<number>(24);

  useEffect(() => {
    const loadMetrics = async () => {
      setLoading(true);
      try {
        const data = await adminApi.getMetrics(hours);
        setMetrics(data);
      } catch (error) {
        console.error('Error loading metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();

    // Subscribe to real-time updates
    const unsubscribe = monitoringService.subscribe((data) => {
      if ('response_times' in data) {
        setMetrics(data as MetricsResponse);
      }
    });
    monitoringService.startPolling(10000);

    return () => {
      monitoringService.stopPolling();
      unsubscribe();
    };
  }, [hours]);

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-500" />
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  // Prepare data for charts
  const requestVolumeData = metrics.request_volume.map((item) => ({
    time: new Date(item.timestamp).toLocaleTimeString('uz-UZ', {
      hour: '2-digit',
      minute: '2-digit',
    }),
    count: item.count,
  }));

  const responseTimeData = metrics.response_times.by_endpoint
    .slice(0, 10)
    .map((item) => ({
      endpoint: item.endpoint.length > 30 ? item.endpoint.substring(0, 30) + '...' : item.endpoint,
      avgTime: item.avg_response_time,
      count: item.request_count,
    }));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Time Range Selector */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <label className="text-sm font-medium text-gray-700">Vaqt oralig'i:</label>
          <select
            value={hours}
            onChange={(e) => setHours(Number(e.target.value))}
            className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value={1}>Oxirgi 1 soat</option>
            <option value={6}>Oxirgi 6 soat</option>
            <option value={24}>Oxirgi 24 soat</option>
            <option value={168}>Oxirgi 7 kun</option>
          </select>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 flex-shrink-0" />
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">O'rtacha javob vaqti</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-indigo-900">
            {metrics.response_times.overall_avg.toFixed(0)}ms
          </p>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0" />
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Xato darajasi</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-red-900">
            {metrics.error_rate.error_rate.toFixed(2)}%
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {metrics.error_rate.error_count} / {metrics.error_rate.total_requests} so'rov
          </p>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Muvaffaqiyat darajasi</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-green-900">
            {metrics.error_rate.success_rate.toFixed(2)}%
          </p>
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Faol foydalanuvchilar</h3>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-blue-900">{metrics.active_users}</p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Oxirgi {hours} soat</p>
        </Card>
      </div>

      {/* Request Volume Chart */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">So'rovlar hajmi</h3>
        <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
          <LineChart data={requestVolumeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={2}
              name="So'rovlar soni"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Response Time by Endpoint */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Endpoint bo'yicha javob vaqti (Top 10)
        </h3>
        <ResponsiveContainer width="100%" height={300} className="sm:h-[400px]">
          <BarChart data={responseTimeData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="endpoint" type="category" width={200} />
            <Tooltip />
            <Legend />
            <Bar dataKey="avgTime" fill="#6366f1" name="O'rtacha vaqt (ms)" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Top Endpoints by Request Count */}
      <Card className="p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Eng ko'p so'rovlar (Top 10)
        </h3>
        <div className="space-y-2">
          {metrics.response_times.by_endpoint
            .sort((a, b) => b.request_count - a.request_count)
            .slice(0, 10)
            .map((item, index) => (
              <div
                key={item.endpoint}
                className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <span className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-indigo-100 text-indigo-700 rounded-full font-semibold text-xs sm:text-sm flex-shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 text-xs sm:text-sm truncate">{item.endpoint}</p>
                    <p className="text-xs text-gray-500">
                      {item.avg_response_time.toFixed(0)}ms o'rtacha
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className="font-semibold text-indigo-900 text-sm sm:text-base">{item.request_count}</p>
                  <p className="text-xs text-gray-500">so'rov</p>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  );
};

