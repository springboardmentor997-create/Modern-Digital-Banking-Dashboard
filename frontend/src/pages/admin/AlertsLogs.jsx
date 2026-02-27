import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Shield, Activity, Clock, Search, Filter } from 'lucide-react';
import { getSystemAlerts, getSuspiciousActivity } from '../../api/admin';

const AlertsLogs = () => {
  const [alerts, setAlerts] = useState([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('alerts');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [alertsData, suspiciousData] = await Promise.all([
          getSystemAlerts(),
          getSuspiciousActivity()
        ]);
        setAlerts(alertsData);
        setSuspiciousActivity(suspiciousData);
      } catch (error) {
        console.error('Error loading alerts data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = !searchTerm || 
      alert.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.user_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || alert.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const filteredSuspicious = suspiciousActivity.filter(activity => {
    const matchesSearch = !searchTerm || 
      activity.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || activity.severity === filterType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading alerts and logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-2">
          Alerts & System Logs
        </h1>
        <div className="h-0.5 w-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto mb-2"></div>
        <p className="text-sm text-gray-600 font-medium">Monitor system alerts and suspicious activity</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-blue-100">
          <div className="flex items-center">
            <div className="bg-red-500 p-2 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Total Alerts</p>
              <p className="text-lg font-bold text-red-600">{alerts.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-blue-100">
          <div className="flex items-center">
            <div className="bg-orange-500 p-2 rounded-lg">
              <Bell className="w-4 h-4 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Unread Alerts</p>
              <p className="text-lg font-bold text-orange-600">{alerts.filter(a => !a.is_read).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-blue-100">
          <div className="flex items-center">
            <div className="bg-purple-500 p-2 rounded-lg">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">Suspicious Activity</p>
              <p className="text-lg font-bold text-purple-600">{suspiciousActivity.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-3 border border-blue-100">
          <div className="flex items-center">
            <div className="bg-yellow-500 p-2 rounded-lg">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-500">High Priority</p>
              <p className="text-lg font-bold text-yellow-600">
                {suspiciousActivity.filter(a => a.severity === 'high').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-white/30 mb-4 overflow-hidden">
        <div className="flex border-b border-gray-200/50">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`relative px-4 py-3 text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
              activeTab === 'alerts'
                ? 'text-red-600 bg-gradient-to-r from-red-50 to-orange-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-all duration-300 ${
              activeTab === 'alerts' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
            }`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span>System Alerts</span>
            <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'alerts' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {alerts.length}
            </div>
            {activeTab === 'alerts' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-red-500 to-orange-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('suspicious')}
            className={`relative px-4 py-3 text-sm font-semibold transition-all duration-300 flex items-center space-x-2 ${
              activeTab === 'suspicious'
                ? 'text-purple-600 bg-gradient-to-r from-purple-50 to-indigo-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-all duration-300 ${
              activeTab === 'suspicious' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
            }`}>
              <Shield className="w-4 h-4" />
            </div>
            <span>Suspicious Activity</span>
            <div className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'suspicious' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {suspiciousActivity.length}
            </div>
            {activeTab === 'suspicious' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="p-3 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={activeTab === 'alerts' ? 'Search alerts...' : 'Search suspicious activity...'}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
            <div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Types</option>
                  {activeTab === 'alerts' ? (
                    <>
                      <option value="security">Security</option>
                      <option value="system">System</option>
                      <option value="user">User</option>
                    </>
                  ) : (
                    <>
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4">
          {activeTab === 'alerts' && (
            <div>
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-700 mb-1">No System Alerts</h3>
                  <p className="text-gray-500 text-sm">All systems are running smoothly</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAlerts.map((alert) => (
                    <div key={alert.id} className="group bg-gradient-to-r from-white to-red-50/30 p-4 border border-red-100 rounded-xl hover:shadow-lg transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <div className="bg-gradient-to-r from-red-500 to-orange-500 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                              {alert.user_name ? alert.user_name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <div className="ml-3">
                              <p className="font-bold text-gray-900 text-sm">{alert.user_name || 'System'}</p>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                  alert.type === 'security' ? 'bg-red-100 text-red-800' :
                                  alert.type === 'system' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {alert.type?.toUpperCase()}
                                </span>
                                <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2 text-sm leading-relaxed">{alert.message}</p>
                          <div className="flex items-center text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            <span className="text-xs">{new Date(alert.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 ${
                          alert.is_read 
                            ? 'bg-gray-100 text-gray-600' 
                            : 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-md animate-pulse'
                        }`}>
                          {alert.is_read ? 'Read' : 'Unread'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'suspicious' && (
            <div>
              {filteredSuspicious.length === 0 ? (
                <div className="text-center py-8">
                  <div className="bg-gradient-to-br from-green-100 to-emerald-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-700 mb-1">No Suspicious Activity</h3>
                  <p className="text-gray-500 text-sm">All transactions appear normal</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredSuspicious.map((activity, index) => (
                    <div key={index} className="group bg-gradient-to-r from-white to-purple-50/30 p-4 border border-purple-100 rounded-xl hover:shadow-lg transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-3">
                            <div className={`w-4 h-4 rounded-full mr-3 shadow-md animate-pulse ${
                              activity.severity === 'high' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                              activity.severity === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                              'bg-gradient-to-r from-blue-500 to-indigo-500'
                            }`}></div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{activity.user_name}</p>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                  activity.severity === 'high' ? 'bg-red-100 text-red-800' :
                                  activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {activity.severity?.toUpperCase()} RISK
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2 text-sm leading-relaxed">
                            {activity.type === 'large_transaction' 
                              ? `🚨 Large transaction detected: ₹${activity.amount?.toLocaleString()} - ${activity.description}`
                              : `⚠️ Inactive user activity detected: ${activity.email}`
                            }
                          </p>
                          <div className="flex items-center text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            <span className="text-xs">{new Date(activity.date).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsLogs;