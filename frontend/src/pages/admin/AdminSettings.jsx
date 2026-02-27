import { useState, useEffect } from 'react';
import { Settings, User, Shield, Bell, Database, Mail, Key, Save, RefreshCw, CheckCircle2, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/admin';

const AdminSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    general: {
      site_name: 'Banking System',
      maintenance_mode: false,
      max_login_attempts: 5,
      session_timeout: 30
    },
    security: {
      two_factor_required: true,
      password_min_length: 8,
      password_expiry_days: 90,
      ip_whitelist_enabled: false
    },
    notifications: {
      email_notifications: true,
      push_notifications: true,
      alert_threshold: 1000
    },
    database: {
      backup_frequency: 'daily',
      retention_days: 30,
      auto_cleanup: true
    }
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await adminApi.getAllUsers();
      setUsers(data);
    } catch (e) {
      console.error('Failed to load users', e);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleSelect = (id) => {
    setSelectedUsers(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id); else copy.add(id);
      return copy;
    });
  };

  const selectAll = () => {
    setSelectedUsers(new Set(users.map(u => u.id)));
  };

  const clearSelection = () => setSelectedUsers(new Set());

  const handleBulkActivate = async () => {
    try {
      const ids = Array.from(selectedUsers);
      if (!ids.length) return alert('Select users first');
      await adminApi.bulkActivateUsers(ids);
      alert('Activated users');
      await loadUsers();
      clearSelection();
    } catch (e) {
      console.error(e);
      alert('Bulk activate failed');
    }
  };

  const handleBulkDeactivate = async () => {
    try {
      const ids = Array.from(selectedUsers);
      if (!ids.length) return alert('Select users first');
      await adminApi.bulkDeactivateUsers(ids);
      alert('Deactivated users');
      await loadUsers();
      clearSelection();
    } catch (e) {
      console.error(e);
      alert('Bulk deactivate failed');
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings, color: 'from-blue-500 to-cyan-500' },
    { id: 'security', label: 'Security', icon: Shield, color: 'from-red-500 to-pink-500' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'from-purple-500 to-indigo-500' },
    { id: 'database', label: 'Database', icon: Database, color: 'from-green-500 to-emerald-500' },
    { id: 'bulk-operations', label: 'Bulk Operations', icon: User, color: 'from-purple-500 to-pink-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Header with Gradient */}
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-10 blur-3xl rounded-3xl"></div>
        <div className="relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 animate-gradient">
            Admin Settings
          </h1>
          <p className="text-gray-600 text-lg flex items-center">
            <Info className="w-4 h-4 mr-2" />
            Configure system settings and preferences
          </p>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
        {/* Tab Navigation with Enhanced Design */}
        <div className="flex border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-8 py-5 text-sm font-semibold transition-all duration-300 relative group whitespace-nowrap ${
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
        </div>

        <div className="p-10">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">General Settings</h2>
                  <p className="text-sm text-gray-500">Core system configuration</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Site Name
                  </label>
                  <input
                    type="text"
                    value={settings.general.site_name}
                    onChange={(e) => handleSettingChange('general', 'site_name', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm"
                    placeholder="Enter site name"
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Max Login Attempts
                  </label>
                  <input
                    type="number"
                    value={settings.general.max_login_attempts}
                    onChange={(e) => handleSettingChange('general', 'max_login_attempts', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm"
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Session Timeout (minutes)
                  </label>
                  <input
                    type="number"
                    value={settings.general.session_timeout}
                    onChange={(e) => handleSettingChange('general', 'session_timeout', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 bg-white shadow-sm"
                  />
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-blue-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Maintenance Mode</p>
                      <p className="text-sm text-gray-600">Temporarily disable user access</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.general.maintenance_mode}
                        onChange={(e) => handleSettingChange('general', 'maintenance_mode', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-cyan-500 shadow-inner"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                  <p className="text-sm text-gray-500">Advanced security configuration</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Minimum Password Length
                  </label>
                  <input
                    type="number"
                    value={settings.security.password_min_length}
                    onChange={(e) => handleSettingChange('security', 'password_min_length', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all duration-200 bg-white shadow-sm"
                  />
                </div>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Password Expiry (days)
                  </label>
                  <input
                    type="number"
                    value={settings.security.password_expiry_days}
                    onChange={(e) => handleSettingChange('security', 'password_expiry_days', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100 transition-all duration-200 bg-white shadow-sm"
                  />
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-2xl border-2 border-red-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Require 2FA for all users</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.two_factor_required}
                        onChange={(e) => handleSettingChange('security', 'two_factor_required', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-pink-500 shadow-inner"></div>
                    </label>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-2xl border-2 border-red-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">IP Whitelist</p>
                      <p className="text-sm text-gray-600">Restrict access by IP</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.ip_whitelist_enabled}
                        onChange={(e) => handleSettingChange('security', 'ip_whitelist_enabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-red-500 peer-checked:to-pink-500 shadow-inner"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
                  <p className="text-sm text-gray-500">Manage system alerts and notifications</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    Alert Threshold (₹)
                  </label>
                  <input
                    type="number"
                    value={settings.notifications.alert_threshold}
                    onChange={(e) => handleSettingChange('notifications', 'alert_threshold', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 bg-white shadow-sm"
                  />
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl border-2 border-purple-100 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Email Notifications</p>
                      <p className="text-sm text-gray-600">Send alerts via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.email_notifications}
                        onChange={(e) => handleSettingChange('notifications', 'email_notifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-indigo-500 shadow-inner"></div>
                    </label>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-2xl border-2 border-purple-100 shadow-sm md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Push Notifications</p>
                      <p className="text-sm text-gray-600">Send browser push notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications.push_notifications}
                        onChange={(e) => handleSettingChange('notifications', 'push_notifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-indigo-500 shadow-inner"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Database Settings */}
          {activeTab === 'database' && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Database className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Database Settings</h2>
                  <p className="text-sm text-gray-500">Configure backup and maintenance</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Backup Frequency
                  </label>
                  <select
                    value={settings.database.backup_frequency}
                    onChange={(e) => handleSettingChange('database', 'backup_frequency', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-white shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Retention Period (days)
                  </label>
                  <input
                    type="number"
                    value={settings.database.retention_days}
                    onChange={(e) => handleSettingChange('database', 'retention_days', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 bg-white shadow-sm"
                  />
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-100 shadow-sm md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">Auto Cleanup</p>
                      <p className="text-sm text-gray-600">Automatically remove old backup files</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.database.auto_cleanup}
                        onChange={(e) => handleSettingChange('database', 'auto_cleanup', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-500 peer-checked:to-emerald-500 shadow-inner"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Management */}
          {activeTab === 'bulk-operations' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Bulk Operations</h2>
                  <p className="text-sm text-gray-500">Select multiple users and perform actions</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <button onClick={selectAll} className="py-2 px-3 rounded-xl bg-gray-200">Select All</button>
                    <button onClick={clearSelection} className="py-2 px-3 rounded-xl bg-gray-200">Clear</button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={handleBulkActivate} className="py-2 px-3 rounded-xl bg-green-600 text-white">Bulk Activate</button>
                    <button onClick={handleBulkDeactivate} className="py-2 px-3 rounded-xl bg-red-600 text-white">Bulk Deactivate</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {users.map(u => (
                    <label key={u.id} className={`flex items-center p-3 border rounded ${selectedUsers.has(u.id) ? 'bg-blue-50 border-blue-200' : ''}`}>
                      <input type="checkbox" checked={selectedUsers.has(u.id)} onChange={() => toggleSelect(u.id)} className="mr-3" />
                      <div>
                        <div className="font-semibold">{u.name}</div>
                        <div className="text-xs text-gray-600">{u.email} — {u.role}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-12 pt-8 border-t-2 border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {saved && (
                  <div className="flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-xl animate-slideInLeft shadow-md">
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    <span className="text-sm font-semibold">Settings saved successfully!</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={loading}
                className="group relative inline-flex items-center px-8 py-4 overflow-hidden text-lg font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-3 animate-spin relative z-10" />
                    <span className="relative z-10">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-3 relative z-10" />
                    <span className="relative z-10">Save All Settings</span>
                  </>
                )}
              </button>
            </div>
          </div>
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

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideInLeft {
          animation: slideInLeft 0.5s ease-out;
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

        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type="number"] {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
};

export default AdminSettings;