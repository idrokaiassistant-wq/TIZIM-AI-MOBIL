import { Card } from '../shared';
import { HealthResponse, ServiceStatusResponse } from '../../lib/api/admin';
import { Activity, Clock, Users, TrendingUp } from 'lucide-react';

interface MonitoringPanelProps {
  health: HealthResponse | null;
  services: ServiceStatusResponse | null;
}

export const MonitoringPanel: React.FC<MonitoringPanelProps> = ({ health, services }) => {
  if (!health || !services) {
    return null;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Monitoring</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* API Response Time */}
        <div className="bg-indigo-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span className="text-sm font-medium text-gray-700">Javob vaqti</span>
          </div>
          <p className="text-2xl font-bold text-indigo-900">
            {services.api.avg_response_time.toFixed(0)}ms
          </p>
        </div>

        {/* Error Rate */}
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-gray-700">Xato darajasi</span>
          </div>
          <p className="text-2xl font-bold text-red-900">
            {services.api.error_rate.toFixed(2)}%
          </p>
        </div>

        {/* Active Users */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Faol foydalanuvchilar</span>
          </div>
          <p className="text-2xl font-bold text-green-900">
            {services.api.active_users_1h}
          </p>
          <p className="text-xs text-gray-500 mt-1">Soat davomida</p>
        </div>

        {/* Database Status */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Ma'lumotlar bazasi</span>
          </div>
          <p className="text-lg font-bold text-blue-900">
            {services.database.connected ? 'Ulangan' : 'Uzilgan'}
          </p>
          <p className="text-xs text-gray-500 mt-1">{services.database.status}</p>
        </div>
      </div>

      {/* Service Details */}
      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">API Server</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            services.api.status === 'healthy'
              ? 'bg-green-100 text-green-700'
              : services.api.status === 'degraded'
              ? 'bg-yellow-100 text-yellow-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {services.api.status}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">Ma'lumotlar bazasi</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            services.database.status === 'healthy'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {services.database.status}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">AI Xizmat</span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            services.ai_service.status === 'healthy' || services.ai_service.status === 'disabled'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {services.ai_service.status}
          </span>
        </div>
      </div>
    </Card>
  );
};

