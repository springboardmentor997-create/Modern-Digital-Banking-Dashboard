import { useState, useEffect } from 'react';
import { Users, Shield, AlertTriangle, Activity, Eye, UserCheck, UserX, Database, FileText, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as adminApi from '../api/admin';
import DashboardComplete from './DashboardComplete';
import AdminDashboard from './AdminDashboard';

const RoleDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role && user.role !== 'user') {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      const [usersData, summaryData, alertsData] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getSystemSummary(),
        adminApi.getSystemAlerts()
      ]);
      setUsers(usersData);
      setSystemStats(summaryData);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId) => {
    if (user?.role !== 'admin') return;
    
    const targetUser = users.find(u => u.id === userId);
    const newStatus = targetUser.is_active;
    
    try {
      if (newStatus) {
        await adminApi.deactivateUser(userId);
      } else {
        await adminApi.activateUser(userId);
      }
      loadAdminData();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  // Regular user gets the normal dashboard
  if (user?.role === 'user' || !user?.role) {
    return <DashboardComplete />;
  }

  // Admin gets the dedicated admin dashboard
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = {
    totalUsers: systemStats.total_users || 0,
    activeUsers: systemStats.active_users || 0,
    pendingKYC: systemStats.pending_kyc || 0,
    totalTransactions: systemStats.total_transactions || 0,
    totalAccounts: systemStats.total_accounts || 0,
    ...systemStats
  };

  const getRoleTitle = () => {
    switch (user?.role) {
      case 'admin': return 'System Admin Dashboard';
      case 'auditor': return 'Auditor Dashboard';
      case 'support': return 'Support Dashboard';
      default: return 'Dashboard';
    }
  };

  const canModify = user?.role === 'admin';
  const canViewAll = ['admin', 'auditor', 'support'].includes(user?.role);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            {getRoleTitle()}
          </h1>
          <p className="text-gray-600">
            {user?.role === 'admin' && 'System administration and user management'}
            {user?.role === 'auditor' && 'Read-only access for compliance and audits'}
            {user?.role === 'support' && 'User support and operational assistance'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={24} />
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3">
              <UserCheck className="text-green-600" size={24} />
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3">
              <Shield className="text-orange-600" size={24} />
              <div>
                <p className="text-sm text-gray-500">Pending KYC</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingKYC}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3">
              <Activity className="text-purple-600" size={24} />
              <div>
                <p className="text-sm text-gray-500">Total Balance</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.totalBalance?.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3">
              <Database className="text-red-600" size={24} />
              <div>
                <p className="text-sm text-gray-500">System Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{systemStats.unreadAlerts || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts & Logs Section */}
        {canViewAll && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} /> System Alerts
              </h2>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {alerts.map(alert => (
                  <div key={alert.id} className="p-3 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                        alert.type === 'security' ? 'bg-red-500' :
                        alert.type === 'system' ? 'bg-blue-500' : 'bg-green-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      {!alert.read && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FileText size={20} /> System Logs
              </h2>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {logs.map(log => (
                  <div key={log.id} className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        log.level === 'info' ? 'bg-blue-100 text-blue-800' :
                        log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900 font-medium">{log.action}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* User Management */}
        {canViewAll && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={20} /> User Management
              {user?.role === 'auditor' && <span className="text-sm text-gray-500 ml-2">(Read-Only)</span>}
              {user?.role === 'support' && <span className="text-sm text-gray-500 ml-2">(Support View)</span>}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-500">User</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">KYC</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Balance</th>
                    {canModify && <th className="text-left py-3 text-sm font-medium text-gray-500">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {users.map(userData => (
                    <tr key={userData.id} className="border-b border-gray-100">
                      <td className="py-3">
                        <div>
                          <p className="font-medium text-gray-900">{userData.name}</p>
                          <p className="text-sm text-gray-500">{userData.email}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          userData.kyc_status === 'verified' ? 'bg-green-100 text-green-800' :
                          userData.kyc_status === 'unverified' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {userData.kyc_status}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          userData.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {userData.is_active ? 'active' : 'inactive'}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="font-medium text-gray-900">₹{userData.balance?.toLocaleString() || '0'}</span>
                      </td>
                      {canModify && (
                        <td className="py-3">
                          <div className="flex gap-2">
                            <button className="text-blue-600 hover:text-blue-800">
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => toggleUserStatus(userData.id)}
                              className={userData.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'}
                            >
                              {userData.is_active ? <UserX size={16} /> : <UserCheck size={16} />}
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoleDashboard;