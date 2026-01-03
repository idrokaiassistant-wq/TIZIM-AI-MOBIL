import { useEffect, useState } from 'react';
import { Card } from '../shared';
import { Activity, Database, Brain, Server, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { adminApi, HealthResponse, ServiceStatusResponse } from '../../lib/api/admin';
import { monitoringService } from '../../lib/api/monitoring';
import { MonitoringPanel } from './MonitoringPanel';
import { MetricsDashboard } from './MetricsDashboard';
import { LogViewer } from './LogViewer';

export const AdminDashboard: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [services, setServices] = useState<ServiceStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'metrics' | 'logs'>('overview');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [healthData, servicesData] = await Promise.all([
          adminApi.getHealth(),
          adminApi.getServicesStatus(),
        ]);
        setHealth(healthData);
        setServices(servicesData);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();

    // Start real-time monitoring
    const unsubscribe = monitoringService.subscribe((data) => {
      if ('api' in data) {
        setServices(data as ServiceStatusResponse);
      }
    });
    monitoringService.startPolling(10000); // 10 seconds

    return () => {
      monitoringService.stopPolling();
      unsubscribe();
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'unhealthy':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'bg-green-50 border-green-200';
      case 'degraded':
        return 'bg-yellow-50 border-yellow-200';
      case 'unhealthy':
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="p-5 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-500" />
          <p className="text-gray-600">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'overview'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Umumiy
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'metrics'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Metrikalar
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'logs'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            Loglar
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* Overall Status */}
          {health && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Umumiy Holat</h2>
                <div className="flex items-center gap-2">
                  {getStatusIcon(health.status)}
                  <span className="font-medium text-gray-700">{health.status.toUpperCase()}</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Oxirgi yangilanish: {new Date(health.timestamp).toLocaleString('uz-UZ')}
              </p>
            </Card>
          )}

          {/* Service Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* API Status */}
            {services && (
              <Card className={`p-6 ${getStatusColor(services.api.status)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Server className="w-6 h-6 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">API Server</h3>
                  </div>
                  {getStatusIcon(services.api.status)}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Xato darajasi:</span>
                    <span className="font-medium">{services.api.error_rate.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">O'rtacha javob vaqti:</span>
                    <span className="font-medium">{services.api.avg_response_time.toFixed(0)}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Faol foydalanuvchilar (1h):</span>
                    <span className="font-medium">{services.api.active_users_1h}</span>
                  </div>
                </div>
              </Card>
            )}

            {/* Database Status */}
            {services && (
              <Card className={`p-6 ${getStatusColor(services.database.status)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Database className="w-6 h-6 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Ma'lumotlar bazasi</h3>
                  </div>
                  {getStatusIcon(services.database.status)}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Holat:</span>
                    <span className="font-medium">{services.database.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ulanish:</span>
                    <span className="font-medium">
                      {services.database.connected ? 'Ulangan' : 'Uzilgan'}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* AI Service Status */}
            {services && (
              <Card className={`p-6 ${getStatusColor(services.ai_service.status)}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Brain className="w-6 h-6 text-purple-600" />
                    <h3 className="font-semibold text-gray-900">AI Xizmat</h3>
                  </div>
                  {getStatusIcon(services.ai_service.status)}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">ML:</span>
                    <span className="font-medium">
                      {services.ai_service.ml_enabled ? 'Yoqilgan' : 'O\'chirilgan'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">NLP:</span>
                    <span className="font-medium">
                      {services.ai_service.nlp_enabled ? 'Yoqilgan' : 'O\'chirilgan'}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Monitoring Panel */}
          <MonitoringPanel health={health} services={services} />
        </>
      )}

      {activeTab === 'metrics' && <MetricsDashboard />}

      {activeTab === 'logs' && <LogViewer />}
    </div>
  );
};

