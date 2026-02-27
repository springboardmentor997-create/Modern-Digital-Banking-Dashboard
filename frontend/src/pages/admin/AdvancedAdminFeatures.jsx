import React, { useState, useEffect } from 'react';
import { 
  Shield, Database, Activity, Users, AlertTriangle, Settings, 
  Download, Upload, RefreshCw, Lock, Unlock, Eye, EyeOff,
  Server, Cpu, HardDrive, Network, Clock, Zap, CheckCircle2, XCircle, Info
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/admin';

const AdvancedAdminFeatures = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('system-control');
  const [systemStats, setSystemStats] = useState({});
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [bulkOperations, setBulkOperations] = useState({ selectedUsers: [] });
  const [securitySettings, setSecuritySettings] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    try {
      setLoading(true);
      const [health, summary] = await Promise.all([
        adminApi.getSystemHealth(),
        adminApi.getSystemSummary()
      ]);
      setSystemStats({ ...health, ...summary });
    } catch (error) {
      console.error('Failed to load system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMaintenanceMode = () => {
    setMaintenanceMode(!maintenanceMode);
  };

  const executeSystemCommand = (command) => {
    console.log(`Executing system command: ${command}`);
  };

  const tabs = [
    { id: 'system-control', label: 'System Control', icon: Server, color: 'from-blue-500 to-cyan-500' },
    { id: 'bulk-operations', label: 'Bulk Operations', icon: Users, color: 'from-purple-500 to-pink-500' },
    { id: 'security-center', label: 'Security Center', icon: Shield, color: 'from-red-500 to-orange-500' },
    { id: 'data-management', label: 'Data Management', icon: Database, color: 'from-green-500 to-emerald-500' },
    { id: 'monitoring', label: 'Live Monitoring', icon: Activity, color: 'from-indigo-500 to-purple-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Header with Gradient */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-10 blur-3xl rounded-3xl"></div>
        <div className="relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 animate-gradient">
            Advanced Admin Features
          </h1>
          <p className="text-gray-600 text-lg flex items-center">
            <Zap className="w-4 h-4 mr-2" />
            Powerful administrative tools and system controls
          </p>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 overflow-x-auto">
          <nav className="flex">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-5 text-sm font-semibold transition-all duration-300 relative group whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {activeTab === tab.id && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${tab.color} shadow-lg`}></div>
                  )}
                  <Icon className={`w-5 h-5 mr-3 relative z-10 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                  <span className="relative z-10">{tab.label}</span>
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white shadow-lg"></div>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'system-control' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Server className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">System Control Panel</h2>
                  <p className="text-sm text-gray-500">Monitor and manage system operations</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-6 rounded-2xl border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-green-900 text-lg">System Status</h3>
                    <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                      <span className="text-green-700 font-medium">Uptime:</span>
                      <span className="font-bold text-green-900">99.9%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                      <span className="text-green-700 font-medium">Response:</span>
                      <span className="font-bold text-green-900">120ms</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 via-cyan-50 to-sky-50 p-6 rounded-2xl border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-blue-900 text-lg">Resource Usage</h3>
                    <Cpu className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                      <span className="text-blue-700 font-medium">CPU:</span>
                      <span className="font-bold text-blue-900">45%</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                      <span className="text-blue-700 font-medium">Memory:</span>
                      <span className="font-bold text-blue-900">62%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-violet-50 p-6 rounded-2xl border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-purple-900 text-lg">Maintenance</h3>
                    <Settings className="w-6 h-6 text-purple-600" />
                  </div>
                  <button
                    onClick={toggleMaintenanceMode}
                    className={`w-full py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105 ${
                      maintenanceMode 
                        ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white' 
                        : 'bg-gradient-to-r from-green-600 to-emerald-600 text-white'
                    }`}
                  >
                    {maintenanceMode ? (
                      <span className="flex items-center justify-center">
                        <XCircle className="w-4 h-4 mr-2" />
                        Exit Maintenance
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Enter Maintenance
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Restart Services', icon: RefreshCw, gradient: 'from-blue-500 to-cyan-500' },
                  { label: 'Clear Cache', icon: Database, gradient: 'from-green-500 to-emerald-500' },
                  { label: 'Backup System', icon: Download, gradient: 'from-purple-500 to-pink-500' },
                  { label: 'System Logs', icon: Activity, gradient: 'from-orange-500 to-red-500' }
                ].map(cmd => {
                  const Icon = cmd.icon;
                  return (
                    <button
                      key={cmd.label}
                      onClick={() => executeSystemCommand(cmd.label)}
                      className={`group flex flex-col items-center p-5 bg-gradient-to-br ${cmd.gradient} hover:shadow-2xl border-2 border-white/50 rounded-2xl transition-all duration-300 transform hover:scale-105`}
                    >
                      <Icon className="w-8 h-8 text-white mb-3 group-hover:animate-bounce" />
                      <span className="text-sm font-bold text-white text-center">{cmd.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'bulk-operations' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Bulk Operations</h2>
                  <p className="text-sm text-gray-500">Perform actions on multiple users simultaneously</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center">
                  <Info className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <h3 className="font-bold text-yellow-900 mb-1">Important Notice</h3>
                    <p className="text-sm text-yellow-700">Bulk operations affect multiple users. Please use with caution.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { label: 'Bulk Activate Users', icon: Unlock, desc: 'Activate multiple user accounts', gradient: 'from-green-500 to-emerald-500' },
                  { label: 'Bulk Deactivate Users', icon: Lock, desc: 'Deactivate multiple user accounts', gradient: 'from-red-500 to-pink-500' },
                  { label: 'Export User Data', icon: Download, desc: 'Export user data in various formats', gradient: 'from-blue-500 to-cyan-500' },
                  { label: 'Import Users (CSV)', icon: Upload, desc: 'Import users from CSV file', gradient: 'from-purple-500 to-indigo-500' },
                  { label: 'Send Notifications', icon: AlertTriangle, desc: 'Send bulk notifications to users', gradient: 'from-orange-500 to-yellow-500' },
                  { label: 'Reset Passwords', icon: RefreshCw, desc: 'Reset passwords for selected users', gradient: 'from-pink-500 to-rose-500' }
                ].map(operation => {
                  const Icon = operation.icon;
                  return (
                    <div key={operation.label} className="group bg-white border-2 border-gray-200 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 hover:border-purple-300">
                      <div className="flex items-center mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${operation.gradient} rounded-xl flex items-center justify-center mr-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-bold text-gray-900 text-lg">{operation.label}</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{operation.desc}</p>
                      <button className={`w-full py-3 px-4 bg-gradient-to-r ${operation.gradient} text-white rounded-xl font-bold hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
                        Execute
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'security-center' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Security Control Center</h2>
                  <p className="text-sm text-gray-500">Advanced security monitoring and controls</p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <h3 className="font-bold text-red-900 mb-1">Security Warning</h3>
                    <p className="text-sm text-red-700">Changes to security policies affect all users immediately.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 text-lg mb-4">Security Policies</h4>
                  {[
                    { label: 'Two-Factor Authentication', enabled: true },
                    { label: 'Password Complexity', enabled: true },
                    { label: 'Session Timeout (30min)', enabled: false },
                    { label: 'IP Whitelist', enabled: false },
                    { label: 'Failed Login Lockout', enabled: true }
                  ].map(policy => (
                    <div key={policy.label} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border-2 border-gray-200 hover:border-red-300 transition-all duration-300">
                      <span className="text-sm font-semibold text-gray-900">{policy.label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={policy.enabled} className="sr-only peer" readOnly />
                        <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-orange-500 shadow-inner"></div>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 text-lg mb-4">Security Alerts</h4>
                  {[
                    { type: 'Failed Login Attempts', count: 12, severity: 'high' },
                    { type: 'Suspicious IP Access', count: 3, severity: 'medium' },
                    { type: 'Large Transactions', count: 5, severity: 'low' }
                  ].map(alert => (
                    <div key={alert.type} className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          alert.severity === 'high' ? 'bg-red-500 animate-pulse' :
                          alert.severity === 'medium' ? 'bg-yellow-500' :
                          'bg-blue-500'
                        }`}></div>
                        <div>
                          <span className="text-sm font-semibold text-gray-900 block">{alert.type}</span>
                          <span className={`text-xs px-2 py-1 rounded-full inline-block mt-1 ${
                            alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                            alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-2xl text-gray-900">{alert.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data-management' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Database Management</h2>
                  <p className="text-sm text-gray-500">Advanced data operations and maintenance</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 text-lg mb-4">Database Operations</h4>
                  {[
                    { label: 'Full Database Backup', icon: Download, gradient: 'from-blue-500 to-cyan-500' },
                    { label: 'Incremental Backup', icon: Database, gradient: 'from-green-500 to-emerald-500' },
                    { label: 'Data Cleanup', icon: RefreshCw, gradient: 'from-orange-500 to-red-500' },
                    { label: 'Index Optimization', icon: Zap, gradient: 'from-purple-500 to-pink-500' }
                  ].map(op => {
                    const Icon = op.icon;
                    return (
                      <button key={op.label} className={`w-full flex items-center p-4 bg-gradient-to-r ${op.gradient} rounded-xl hover:shadow-xl transition-all duration-300 transform hover:scale-105 group`}>
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mr-4 group-hover:bg-white/30 transition-all duration-300">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-bold text-white">{op.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 text-lg mb-4">Storage Statistics</h4>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 shadow-lg">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                        <span className="font-medium text-green-700">Database Size:</span>
                        <span className="font-bold text-green-900 text-lg">2.4 GB</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                        <span className="font-medium text-green-700">Available Space:</span>
                        <span className="font-bold text-green-900 text-lg">47.6 GB</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/60 rounded-xl">
                        <span className="font-medium text-green-700">Total Records:</span>
                        <span className="font-bold text-green-900 text-lg">1,234,567</span>
                      </div>
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-green-700 font-medium">Storage Usage</span>
                          <span className="text-green-900 font-bold">15%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                          <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full shadow-lg" style={{width: '15%'}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Activity className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Real-time System Monitoring</h2>
                  <p className="text-sm text-gray-500">Live system performance and activity monitoring</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  { label: 'Active Users', value: '1,234', icon: Users, gradient: 'from-blue-500 to-cyan-500' },
                  { label: 'Transactions/min', value: '45', icon: Activity, gradient: 'from-green-500 to-emerald-500' },
                  { label: 'API Calls/sec', value: '128', icon: Network, gradient: 'from-purple-500 to-pink-500' },
                  { label: 'Error Rate', value: '0.02%', icon: AlertTriangle, gradient: 'from-red-500 to-orange-500' }
                ].map(metric => {
                  const Icon = metric.icon;
                  return (
                    <div key={metric.label} className={`bg-gradient-to-br ${metric.gradient} rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
                      <div className="flex items-center justify-between mb-3">
                        <Icon className="w-6 h-6 text-white/80" />
                        <span className="text-3xl font-bold text-white">{metric.value}</span>
                      </div>
                      <p className="text-sm text-white/90 font-medium">{metric.label}</p>
                    </div>
                  );
                })}
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
                <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                  Recent Activity Log
                </h4>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {[
                    { time: '14:32:15', action: 'User login', user: 'john@example.com', status: 'success' },
                    { time: '14:31:42', action: 'Transaction created', user: 'jane@example.com', status: 'success' },
                    { time: '14:30:18', action: 'Failed login attempt', user: 'unknown@hacker.com', status: 'failed' },
                    { time: '14:29:55', action: 'Password reset', user: 'support@bank.com', status: 'success' },
                    { time: '14:28:33', action: 'Account created', user: 'newuser@example.com', status: 'success' },
                    { time: '14:27:12', action: 'Data export', user: 'admin@bank.com', status: 'success' }
                  ].map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 hover:border-indigo-300 transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-500 font-mono text-sm bg-white px-3 py-1 rounded-lg">{log.time}</span>
                        <span className="font-semibold text-gray-900">{log.action}</span>
                        <span className="text-gray-600 text-sm">{log.user}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        log.status === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
        }

        @keyframes gradientShift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </div>
  );
};

export default AdvancedAdminFeatures;