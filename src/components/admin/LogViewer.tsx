import { useEffect, useState } from 'react';
import { Card } from '../shared';
import { Search, Download, RefreshCw, AlertCircle, Info, XCircle } from 'lucide-react';
import { adminApi } from '../../lib/api/admin';
import type { LogEntry } from '../../lib/api/admin';

export const LogViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(50);
  
  // Filters
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [endpointFilter, setEndpointFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hours, setHours] = useState<number>(24);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getLogs({
        page,
        page_size: pageSize,
        level: levelFilter || undefined,
        endpoint: endpointFilter || undefined,
        search: searchQuery || undefined,
        hours,
      });
      setLogs(response.logs);
      setTotal(response.total);
    } catch (error) {
      console.error('Error loading logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadLogs, 10000);
    return () => clearInterval(interval);
  }, [page, levelFilter, endpointFilter, searchQuery, hours]);

  const getLevelIcon = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR':
      case 'CRITICAL':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'WARNING':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'INFO':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR':
      case 'CRITICAL':
        return 'bg-red-50 border-red-200';
      case 'WARNING':
        return 'bg-yellow-50 border-yellow-200';
      case 'INFO':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const exportLogs = () => {
    const csv = [
      ['ID', 'Level', 'Message', 'Timestamp', 'Endpoint', 'Method', 'Status Code', 'Response Time', 'User ID'].join(','),
      ...logs.map(log => [
        log.id,
        log.level,
        `"${log.message.replace(/"/g, '""')}"`,
        log.timestamp,
        log.endpoint || '',
        log.method || '',
        log.status_code || '',
        log.response_time || '',
        log.user_id || '',
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Filters */}
      <Card className="p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Barcha darajalar</option>
            <option value="DEBUG">DEBUG</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
            <option value="CRITICAL">CRITICAL</option>
          </select>

          <input
            type="text"
            placeholder="Endpoint..."
            value={endpointFilter}
            onChange={(e) => setEndpointFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <div className="flex gap-2 sm:col-span-2 lg:col-span-1">
            <select
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="flex-1 px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={1}>Oxirgi 1 soat</option>
              <option value={6}>Oxirgi 6 soat</option>
              <option value={24}>Oxirgi 24 soat</option>
              <option value={168}>Oxirgi 7 kun</option>
            </select>
            <button
              onClick={loadLogs}
              className="px-3 sm:px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 active:scale-95 transition-transform"
              aria-label="Yangilash"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={exportLogs}
              className="px-3 sm:px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 active:scale-95 transition-transform"
              aria-label="Export"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </Card>

      {/* Logs List */}
      <Card className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Loglar ({total})
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-3 sm:px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 active:scale-95 transition-transform"
            >
              Oldingi
            </button>
            <span className="px-3 py-2 text-xs sm:text-sm text-gray-600">
              {page} / {Math.ceil(total / pageSize)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / pageSize)}
              className="px-3 sm:px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 active:scale-95 transition-transform"
            >
              Keyingi
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
            <p className="text-gray-600">Yuklanmoqda...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Loglar topilmadi
          </div>
        ) : (
          <div className="space-y-2 max-h-[500px] sm:max-h-[600px] overflow-y-auto -mx-3 sm:mx-0 px-3 sm:px-0">
            {logs.map((log) => (
              <div
                key={log.id}
                className={`p-3 sm:p-4 rounded-lg border ${getLevelColor(log.level)}`}
              >
                <div className="flex items-start gap-2 sm:gap-3">
                  <div className="flex-shrink-0 mt-0.5">{getLevelIcon(log.level)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5">
                      <span className="font-semibold text-xs sm:text-sm">{log.level}</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString('uz-UZ', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {log.endpoint && (
                        <span className="text-xs bg-gray-200 px-1.5 sm:px-2 py-0.5 rounded truncate max-w-[150px] sm:max-w-none">
                          {log.method} {log.endpoint.length > 20 ? log.endpoint.substring(0, 20) + '...' : log.endpoint}
                        </span>
                      )}
                      {log.status_code && (
                        <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded whitespace-nowrap ${
                          log.status_code >= 400
                            ? 'bg-red-200 text-red-700'
                            : log.status_code >= 300
                            ? 'bg-yellow-200 text-yellow-700'
                            : 'bg-green-200 text-green-700'
                        }`}>
                          {log.status_code}
                        </span>
                      )}
                      {log.response_time && (
                        <span className="text-xs text-gray-500 whitespace-nowrap">
                          {log.response_time.toFixed(0)}ms
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 break-words">{log.message}</p>
                    {log.error_details && (
                      <details className="mt-2">
                        <summary className="text-xs text-red-600 cursor-pointer">
                          Xato tafsilotlari
                        </summary>
                        <pre className="mt-2 text-xs bg-red-50 p-2 rounded overflow-x-auto">
                          {log.error_details}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

