import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, Settings, X, Eye } from 'lucide-react';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import axiosClient from '../api/client';
import { getAlerts, markAlertAsRead, markAlertsAsRead, deleteAlert, deleteAlerts } from '../api/alerts';
import NotificationService from '../services/NotificationService';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [summary, setSummary] = useState({});
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    console.log('🔔 Alerts Page - Checking Authentication');
    
    fetchAlerts();
    fetchSummary();
    checkNotificationPermission();

    // Refresh alerts when other parts of the app create alerts
    const handler = () => fetchAlerts();
    window.addEventListener('alertsUpdated', handler);
    return () => window.removeEventListener('alertsUpdated', handler);
  }, []);

  const checkNotificationPermission = () => {
    setNotificationsEnabled(Notification.permission === 'granted');
  };

  const [shownAlertIds, setShownAlertIds] = useState(new Set());
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const requestNotificationPermission = async () => {
    const permission = await NotificationService.requestPermission();
    setNotificationsEnabled(permission === 'granted');
    if (permission === 'granted') {
      NotificationService.showNotification('🔔 Notifications Enabled', {
        body: 'You will now receive banking alerts and notifications'
      });
    }
  };

  const playNotificationSound = () => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      g.gain.value = 0.02;
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      setTimeout(() => {
        o.stop();
        ctx.close();
      }, 140);
    } catch (e) {
      // ignore audio errors
    }
  };

  const notifyNewAlerts = (alertList) => {
    if (!notificationsEnabled) return;

    const newAlerts = alertList.filter(a => !a.is_read && !shownAlertIds.has(a.id));
    if (newAlerts.length === 0) return;

    newAlerts.forEach(a => {
      NotificationService.showNotification(`${a.title || 'Alert'}`, {
        body: a.message,
        tag: a.id
      });
      playNotificationSound();
      shownAlertIds.add(a.id);
    });

    // Trigger state update for shown IDs
    setShownAlertIds(new Set(shownAlertIds));
  };

  const fetchAlerts = async () => {
    try {
      const data = await getAlerts();
      setAlerts(data);
      notifyNewAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axiosClient.get('/api/alerts/summary');
      const data = response.data;
      setSummary(data);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      setSummary({ total: 0, critical: 0, high: 0, medium: 0, recent: [] });
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markAlertAsRead(id);
      setAlerts(alerts.map(alert => 
        alert.id === id ? { ...alert, is_read: true } : alert
      ));
    } catch (error) {
      console.error('Failed to mark alert as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unread = alerts.filter(a => !a.is_read).map(a => a.id);
      if (unread.length === 0) return;
      await markAlertsAsRead(unread);
      setAlerts(alerts.map(a => ({ ...a, is_read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const dismissAlert = async (alertId) => {
    try {
      await deleteAlert(alertId);
      setAlerts(alerts.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Failed to dismiss alert:', error);
    }
  };

  const dismissAll = async () => {
    try {
      const ids = alerts.map(a => a.id);
      if (ids.length === 0) return;
      await deleteAlerts(ids);
      setAlerts([]);
    } catch (error) {
      console.error('Failed to dismiss all alerts:', error);
    }
  };

  const openAlertDetails = (alert) => {
    setSelectedAlert(alert);
    if (!alert.is_read) handleMarkAsRead(alert.id);
  };

  const closeAlertDetails = () => {
    setSelectedAlert(null);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="text-orange-500" />;
      case 'success': return <CheckCircle className="text-green-500" />;
      case 'info': return <Info className="text-blue-500" />;
      default: return <Bell className="text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'critical':
      case 'high':
        return <AlertTriangle size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !alert.is_read;
    return alert.priority === filter;
  });

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <Navbar title="Notifications" />
      
      <div className="p-6 max-w-6xl mx-auto w-full space-y-6">
        {/* Header with Filter */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Alert Center</h1>
          <div className="flex gap-2">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-blue-200 rounded-lg px-3 py-2 bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              <option value="all">All Alerts</option>
              <option value="unread">Unread</option>
              <option value="critical">Critical</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical</p>
                <p className="text-2xl font-bold text-red-600">{summary.critical || 0}</p>
              </div>
              <AlertTriangle className="text-red-500" size={24} />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">{summary.high || 0}</p>
              </div>
              <Bell className="text-orange-500" size={24} />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Medium Priority</p>
                <p className="text-2xl font-bold text-yellow-600">{summary.medium || 0}</p>
              </div>
              <Bell className="text-yellow-500" size={24} />
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-lg shadow border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Alerts</p>
                <p className="text-2xl font-bold text-blue-600">{summary.total || 0}</p>
              </div>
              <Bell className="text-blue-500" size={24} />
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-blue-100 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings className="text-gray-500" size={20} />
              <div>
                <h3 className="font-medium text-gray-900">Push Notifications</h3>
                <p className="text-sm text-gray-500">
                  {notificationsEnabled ? 'Enabled' : 'Disabled'} - Get alerts for transactions and budgets
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {!notificationsEnabled ? (
                <button
                  onClick={requestNotificationPermission}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                >
                  Enable Notifications
                </button>
              ) : (
                <button
                  onClick={() => { setNotificationsEnabled(false); NotificationService.permission = 'denied'; }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
                >
                  Disable Notifications
                </button>
              )}

              <button
                onClick={markAllAsRead}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm"
                title="Mark all alerts as read"
              >
                Mark all read
              </button>

              <button
                onClick={dismissAll}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 text-sm"
                title="Dismiss all alerts"
              >
                Dismiss all
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-3 py-2 rounded-lg text-sm ${soundEnabled ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-200 text-gray-700'}`}
                title="Toggle sound for notifications"
              >
                {soundEnabled ? 'Sound: On' : 'Sound: Off'}
              </button>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow border border-blue-100">
          <div className="p-4 border-b border-blue-100">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {filter === 'all' ? 'All Alerts' : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Alerts`}
              <span className="ml-2 text-sm text-gray-500">({filteredAlerts.length})</span>
            </h2>
          </div>

          <div className="divide-y">
            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No alerts found</p>
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-4 border-l-4 ${alert.priority ? getPriorityColor(alert.priority) : 'border-gray-200'} ${
                    !alert.is_read ? 'bg-blue-50' : 'bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`mt-1 ${alert.priority === 'critical' || alert.priority === 'high' ? 'text-red-600' : 'text-gray-600'}`}>
                        {alert.priority ? getPriorityIcon(alert.priority) : getIcon(alert.alert_type)}
                      </div>
                      <div className="flex-1" onClick={() => openAlertDetails(alert)} style={{ cursor: 'pointer' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{alert.title}</h3>
                          {!alert.is_read && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                              New
                            </span>
                          )}
                          {alert.priority && (
                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(alert.priority)}`}>
                              {alert.priority}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">{alert.message}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {!alert.is_read && (
                        <button
                          onClick={() => handleMarkAsRead(alert.id)}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Mark as read"
                        >
                          <Eye size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => dismissAlert(alert.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Dismiss alert"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Alert Details Modal */}
        {selectedAlert && (
          <Modal isOpen={!!selectedAlert} onClose={closeAlertDetails} title={selectedAlert.title || 'Alert details'}>
            <div>
              <p className="text-sm text-gray-700 mb-2">{selectedAlert.message}</p>
              <p className="text-xs text-gray-500 mb-4">{new Date(selectedAlert.created_at).toLocaleString()}</p>
              <div className="flex gap-2 justify-end">
                {!selectedAlert.is_read && (
                  <button onClick={() => handleMarkAsRead(selectedAlert.id)} className="px-3 py-2 bg-green-600 text-white rounded">Mark as read</button>
                )}
                <button onClick={() => { dismissAlert(selectedAlert.id); closeAlertDetails(); }} className="px-3 py-2 bg-red-600 text-white rounded">Dismiss</button>
                <button onClick={closeAlertDetails} className="px-3 py-2 bg-gray-200 text-gray-800 rounded">Close</button>
              </div>
            </div>
          </Modal>
        )}

      </div>
    </div>
  );
};

export default Alerts;