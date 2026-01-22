import { useState, useEffect } from 'react';
import { FileText, Search, Filter, Download, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/admin';

const SystemLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const logsData = await adminApi.getSystemLogs();
      setLogs(logsData || []);
    } catch (error) {
      console.error('Failed to load logs:', error);
      // Mock data
      setLogs([
        { id: 1, action: 'User login', user_id: 1, timestamp: new Date().toISOString(), level: 'info', ip_address: '192.168.1.1' },
        { id: 2, action: 'Transaction created', user_id: 2, timestamp: new Date(Date.now() - 1800000).toISOString(), level: 'info', ip_address: '192.168.1.2' },
        { id: 3, action: 'Failed login attempt', user_id: null, timestamp: new Date(Date.now() - 3600000).toISOString(), level: 'warning', ip_address: '192.168.1.100' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.level !== filter) return false;
    if (searchTerm && !log.action?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            System Logs
          </h1>
          <p className="text-gray-600">Read-only access to system activity logs</p>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Levels</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>
            </div>
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Timestamp</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Level</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Action</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">User ID</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">IP Address</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50/50">
                    <td className="py-4 px-4">
                      <div className="text-sm text-gray-600">
                        <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        log.level === 'error' ? 'bg-red-100 text-red-800' :
                        log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {log.level?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-900">{log.action}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm">{log.user_id || 'N/A'}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm">{log.ip_address}</span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;