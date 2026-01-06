// src/pages/AlertsAndLogs.jsx
import React, { useEffect, useState } from 'react';
import { Loader, AlertTriangle, Eye, Trash2 } from 'lucide-react';
import { getAllAlerts, getSystemLogs, getSuspiciousActivity, markAlertAsResolved } from '../api/alerts';

const Alerts = () => {
  const [activeTab, setActiveTab] = useState('alerts');
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [suspicious, setSuspicious] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchData(activeTab, currentPage);
  }, [activeTab, currentPage]);

  const fetchData = async (tab, page) => {
    try {
      setLoading(true);
      setError(null);

      if (tab === 'alerts') {
        const response = await getAllAlerts(page);
        setAlerts(response.results || response.data || []);
      } else if (tab === 'logs') {
        const response = await getSystemLogs(page);
        setLogs(response.results || response.data || []);
      } else if (tab === 'suspicious') {
        const response = getSuspiciousActivity(page);
        setSuspicious(response.results || response.data || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId) => {
    try {
      await markAlertAsResolved(alertId);
      setAlerts(alerts.filter(a => a.id !== alertId));
    } catch (err) {
      setError('Failed to resolve alert');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Alerts & Logs</h1>
        <p className="text-gray-600">Monitor system activity and security alerts</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
        <div className="flex border-b border-gray-200">
          {['alerts', 'logs', 'suspicious'].map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`flex-1 px-6 py-4 font-semibold text-center transition ${
                activeTab === tab
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'alerts' && 'Active Alerts'}
              {tab === 'logs' && 'System Logs'}
              {tab === 'suspicious' && 'Suspicious Activity'}
            </button>
          ))}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          ) : activeTab === 'alerts' ? (
            <AlertsTable alerts={alerts} onResolve={handleResolveAlert} />
          ) : activeTab === 'logs' ? (
            <LogsTable logs={logs} />
          ) : (
            <SuspiciousActivityTable records={suspicious} />
          )}
        </div>
      </div>
    </div>
  );
};

const AlertsTable = ({ alerts, onResolve }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left px-6 py-3 font-semibold text-gray-900">Alert Type</th>
          <th className="text-left px-6 py-3 font-semibold text-gray-900">Severity</th>
          <th className="text-left px-6 py-3 font-semibold text-gray-900">Message</th>
          <th className="text-left px-6 py-3 font-semibold text-gray-900">Time</th>
          <th className="text-left px-6 py-3 font-semibold text-gray-900">Actions</th>
        </tr>
      </thead>
      <tbody>
        {alerts.map(alert => (
          <tr key={alert.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="px-6 py-4 text-gray-900">{alert.alert_type}</td>
            <td className="px-6 py-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                alert.severity === 'high' ? 'bg-red-100 text-red-700' :
                alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {alert.severity}
              </span>
            </td>
            <td className="px-6 py-4 text-gray-600">{alert.message}</td>
            <td className="px-6 py-4 text-sm text-gray-500">
              {new Date(alert.created_at).toLocaleString()}
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => onResolve(alert.id)}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Resolve
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {alerts.length === 0 && <p className="text-center py-8 text-gray-500">No alerts</p>}
  </div>
);

const LogsTable = ({ logs }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left px-6 py-3 font-semibold text-gray-900">Action</th>
          <th className="text-left px-6 py-3 font-semibold text-gray-900">User</th>
          <th className="text-left px-6 py-3 font-semibold text-gray-900">Details</th>
          <th className="text-left px-6 py-3 font-semibold text-gray-900">Time</th>
        </tr>
      </thead>
      <tbody>
        {logs.map(log => (
          <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="px-6 py-4 text-gray-900">{log.action}</td>
            <td className="px-6 py-4 text-gray-600">{log.user}</td>
            <td className="px-6 py-4 text-gray-600">{log.details}</td>
            <td className="px-6 py-4 text-sm text-gray-500">
              {new Date(log.timestamp).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {logs.length === 0 && <p className="text-center py-8 text-gray-500">No logs</p>}
  </div>
);

const SuspiciousActivityTable = ({ records }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left px-6 py-3 font-semibold text-gray-900">User</th>
          <th className="text-left px-6 py-3 font-semibold text-gray-900">Activity</th>
          <th className="text-left px-6 py-3 font-semibold text-gray-900">Risk Level</th>
          <th className="text-left px-6 py-3 font-semibold text-gray-900">Detected</th>
        </tr>
      </thead>
      <tbody>
        {records.map(record => (
          <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="px-6 py-4 text-gray-900">{record.user_id}</td>
            <td className="px-6 py-4 text-gray-600">{record.activity_type}</td>
            <td className="px-6 py-4">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                record.risk_level === 'high' ? 'bg-red-100 text-red-700' :
                record.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {record.risk_level}
              </span>
            </td>
            <td className="px-6 py-4 text-sm text-gray-500">
              {new Date(record.detected_at).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {records.length === 0 && <p className="text-center py-8 text-gray-500">No suspicious activity detected</p>}
  </div>
);

export default Alerts;