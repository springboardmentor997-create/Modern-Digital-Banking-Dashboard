import React, { useState, useEffect } from 'react';
import { Users, UserCheck, CreditCard, Activity, AlertTriangle, Eye, Search, Phone, Mail, User, HelpCircle, Clock, CheckCircle, Shield, FileText, DollarSign, Calendar, Settings, BarChart3, TrendingUp, AlertCircle, Database, Edit, Trash2, Plus } from 'lucide-react';
import { getAllUsers, activateUser, deactivateUser, updateUser, deleteUser, getSystemSummary, getAllAccounts, getAllTransactions, getKYCOverview, getSuspiciousActivity, getSystemAlerts, getUserAnalytics, getTransactionAnalytics, getFinancialReport, getAuditLogs, getSystemHealth, updateKYCStatus } from '../api/admin';
import { getUsersAudit, getAccountsAudit, getTransactionsAudit, getComplianceSummary, getSystemLogsAudit, getAlertsAudit, getTransactionPatterns, getUserActivityReport } from '../api/auditor';
import { getUserProfile, getUserAccounts, getUserTransactions } from '../api/support';

// Admin Components - System Admin Role (Read-Only for Banking Operations)
export const SystemSummary = () => {
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const data = await getSystemSummary();
        setSummary(data);
      } catch (error) {
        console.error('Error loading system summary:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  const stats = [
    { title: 'Total Users', value: summary.total_users || 0, icon: Users, color: 'bg-gradient-to-br from-blue-500 to-blue-600', bgColor: 'from-blue-50 to-blue-100' },
    { title: 'Active Users', value: summary.active_users || 0, icon: UserCheck, color: 'bg-gradient-to-br from-green-500 to-green-600', bgColor: 'from-green-50 to-green-100' },
    { title: 'Total Accounts', value: summary.total_accounts || 0, icon: CreditCard, color: 'bg-gradient-to-br from-purple-500 to-purple-600', bgColor: 'from-purple-50 to-purple-100' },
    { title: 'Total Transactions', value: summary.total_transactions || 0, icon: Activity, color: 'bg-gradient-to-br from-indigo-500 to-indigo-600', bgColor: 'from-indigo-50 to-indigo-100' },
    { title: 'Pending KYC', value: summary.pending_kyc || 0, icon: AlertTriangle, color: 'bg-gradient-to-br from-orange-500 to-orange-600', bgColor: 'from-orange-50 to-orange-100' },
    { title: 'Verified KYC', value: summary.verified_kyc || 0, icon: Shield, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600', bgColor: 'from-emerald-50 to-emerald-100' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            System Summary
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">Platform overview and key metrics monitoring</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className={`group relative bg-gradient-to-br ${stat.bgColor} backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/30 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-4 right-4 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
                
                <div className="relative flex items-center">
                  <div className={`${stat.color} p-4 rounded-2xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="ml-6">
                    <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{stat.title}</p>
                    <p className="text-4xl font-bold text-gray-900 mt-1 group-hover:text-gray-800 transition-colors">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const handleToggleUser = async (userId, isActive) => {
    try {
      if (isActive) {
        await deactivateUser(userId);
      } else {
        await activateUser(userId);
      }
      loadUsers();
    } catch (error) {
      console.error('Error toggling user status:', error);
    }
  };

  const handleKYCUpdate = async (userId, newStatus) => {
    try {
      await updateKYCStatus(userId, newStatus);
      loadUsers();
    } catch (error) {
      console.error('Error updating KYC status:', error);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && user.is_active) ||
      (filterStatus === 'inactive' && !user.is_active);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">User Management</h1>
        <p className="text-gray-600">Comprehensive user account management and oversight</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="support">Support</option>
              <option value="auditor">Auditor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="bg-blue-500 p-3 rounded-xl">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="bg-green-500 p-3 rounded-xl">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Users</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.is_active).length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="bg-purple-500 p-3 rounded-xl">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">KYC Verified</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.kyc_status === 'verified').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center">
            <div className="bg-indigo-500 p-3 rounded-xl">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">₹{users.reduce((sum, u) => sum + (u.total_balance || 0), 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-blue-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role & Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">KYC Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Account Info</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{user.name || 'N/A'}</div>
                        <div className="text-xs text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {user.phone || 'Not provided'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'support' ? 'bg-yellow-100 text-yellow-800' :
                        user.role === 'auditor' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                      <div>
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                      user.kyc_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {user.kyc_status === 'verified' ? (
                        <><CheckCircle className="w-3 h-3 mr-1" /> Verified</>
                      ) : (
                        <><Clock className="w-3 h-3 mr-1" /> Pending</>
                      )}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-gray-900">
                        {user.account_count || 0} Account{(user.account_count || 0) !== 1 ? 's' : ''}
                      </div>
                      <div className="text-sm text-gray-500">
                        ₹{(user.total_balance || 0).toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleToggleUser(user.id, user.is_active)}
                        className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium transition-all duration-200 ${
                          user.is_active
                            ? 'bg-red-100 text-red-700 hover:bg-red-200 hover:shadow-md'
                            : 'bg-green-100 text-green-700 hover:bg-green-200 hover:shadow-md'
                        }`}
                      >
                        {user.is_active ? (
                          <><Eye className="w-4 h-4 mr-1" /> Deactivate</>
                        ) : (
                          <><UserCheck className="w-4 h-4 mr-1" /> Activate</>
                        )}
                      </button>
                      <button
                        onClick={() => handleKYCUpdate(user.id, user.kyc_status === 'verified' ? 'unverified' : 'verified')}
                        className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 hover:shadow-md transition-all duration-200"
                      >
                        <Shield className="w-4 h-4 mr-1" />
                        {user.kyc_status === 'verified' ? 'Unverify' : 'Verify'} KYC
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const KYCOverview = () => {
  const [kycData, setKycData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadKYCData = async () => {
      try {
        const data = await getKYCOverview();
        setKycData(data);
      } catch (error) {
        console.error('Error loading KYC data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadKYCData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">KYC Overview</h1>
        <p className="text-gray-600">Monitor user verification status</p>
      </div>
      <div className="bg-white/80 backdrop-blur-sm shadow rounded-lg border border-blue-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kycData.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.kyc_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {user.kyc_status === 'verified' ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AccountManagement = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await getAllAccounts();
        setAccounts(data);
      } catch (error) {
        console.error('Error loading accounts:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAccounts();
  }, []);

  const filteredAccounts = accounts.filter(account => 
    !searchTerm || 
    account.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.bank_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Account Management</h1>
        <p className="text-gray-600">View all user accounts (Read-Only)</p>
      </div>

      {/* Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search accounts by user name, email, or bank..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-blue-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Account Owner</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Account Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Bank</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAccounts.map((account) => (
                <tr key={account.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{account.user_name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{account.user_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {account.account_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    ₹{parseFloat(account.balance).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {account.bank_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(account.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredAccounts.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No accounts found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const AlertsAndLogs = () => {
  const [alerts, setAlerts] = useState([]);
  const [suspiciousActivity, setSuspiciousActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('alerts');

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

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent mb-4">
          Alerts & Logs
        </h1>
        <div className="h-1 w-32 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mx-auto mb-4"></div>
        <p className="text-xl text-gray-600 font-medium">Monitor system alerts and suspicious activity</p>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 mb-8 overflow-hidden">
        <div className="flex border-b border-gray-200/50">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`relative px-8 py-6 text-lg font-semibold transition-all duration-300 flex items-center space-x-3 ${
              activeTab === 'alerts'
                ? 'text-red-600 bg-gradient-to-r from-red-50 to-orange-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all duration-300 ${
              activeTab === 'alerts' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span>System Alerts</span>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              activeTab === 'alerts' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {alerts.length}
            </div>
            {activeTab === 'alerts' && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('suspicious')}
            className={`relative px-8 py-6 text-lg font-semibold transition-all duration-300 flex items-center space-x-3 ${
              activeTab === 'suspicious'
                ? 'text-purple-600 bg-gradient-to-r from-purple-50 to-indigo-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className={`p-2 rounded-xl transition-all duration-300 ${
              activeTab === 'suspicious' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'
            }`}>
              <Shield className="w-5 h-5" />
            </div>
            <span>Suspicious Activity</span>
            <div className={`px-3 py-1 rounded-full text-sm font-bold ${
              activeTab === 'suspicious' ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {suspiciousActivity.length}
            </div>
            {activeTab === 'suspicious' && (
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            )}
          </button>
        </div>

        <div className="p-8">
          {activeTab === 'alerts' && (
            <div>
              {alerts.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">No System Alerts</h3>
                  <p className="text-gray-500">All systems are running smoothly</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="group bg-gradient-to-r from-white to-red-50/30 p-6 border border-red-100 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-4">
                            <div className="bg-gradient-to-r from-red-500 to-orange-500 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                              {alert.user_name ? alert.user_name.charAt(0).toUpperCase() : 'S'}
                            </div>
                            <div className="ml-4">
                              <p className="font-bold text-gray-900 text-lg">{alert.user_name || 'System'}</p>
                              <div className="flex items-center space-x-2">
                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                                  {alert.type}
                                </span>
                                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3 text-lg leading-relaxed">{alert.message}</p>
                          <div className="flex items-center text-gray-500">
                            <Clock className="w-4 h-4 mr-2" />
                            <span className="text-sm">{new Date(alert.created_at).toLocaleString()}</span>
                          </div>
                        </div>
                        <div className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 ${
                          alert.is_read 
                            ? 'bg-gray-100 text-gray-600' 
                            : 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg animate-pulse'
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
              {suspiciousActivity.length === 0 ? (
                <div className="text-center py-16">
                  <div className="bg-gradient-to-br from-green-100 to-emerald-200 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Shield className="w-12 h-12 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">No Suspicious Activity</h3>
                  <p className="text-gray-500">All transactions appear normal</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {suspiciousActivity.map((activity, index) => (
                    <div key={index} className="group bg-gradient-to-r from-white to-purple-50/30 p-6 border border-purple-100 rounded-2xl hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center mb-4">
                            <div className={`w-6 h-6 rounded-full mr-4 shadow-lg animate-pulse ${
                              activity.severity === 'high' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                              activity.severity === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                              'bg-gradient-to-r from-blue-500 to-indigo-500'
                            }`}></div>
                            <div>
                              <p className="font-bold text-gray-900 text-lg">{activity.user_name}</p>
                              <div className="flex items-center space-x-2">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                                  activity.severity === 'high' ? 'bg-red-100 text-red-800' :
                                  activity.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                  'bg-blue-100 text-blue-800'
                                }`}>
                                  {activity.severity.toUpperCase()} RISK
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-3 text-lg leading-relaxed">
                            {activity.type === 'large_transaction' 
                              ? `🚨 Large transaction detected: ₹${activity.amount?.toLocaleString()} - ${activity.description}`
                              : `⚠️ Inactive user activity detected: ${activity.email}`
                            }
                          </p>
                          <div className="flex items-center text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span className="text-sm">{new Date(activity.date).toLocaleString()}</span>
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

export const SupportDashboard = () => {
  const [searchUserId, setSearchUserId] = useState('');
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchUserId) return;
    
    setLoading(true);
    try {
      const profile = await getUserProfile(searchUserId);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user data:', error);
      setUserProfile(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Support Dashboard</h1>
        <p className="text-gray-600">Customer support and user assistance</p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-6 mb-6 border border-blue-100">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search User by ID</label>
            <input
              type="number"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              placeholder="Enter user ID..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !searchUserId}
            className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50 flex items-center"
          >
            <Search className="w-4 h-4 mr-2" />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {userProfile && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow p-6 border border-blue-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">User Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="text-lg text-gray-900">{userProfile.name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-lg text-gray-900">{userProfile.email}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Role</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  userProfile.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}>
                  {userProfile.role}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  userProfile.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {userProfile.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const AuditOverview = () => {
  const [complianceSummary, setComplianceSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuditData = async () => {
      try {
        const summary = await getComplianceSummary();
        setComplianceSummary(summary);
      } catch (error) {
        console.error('Error loading audit data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAuditData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;

  const userMetrics = complianceSummary?.user_metrics || {};
  const accountMetrics = complianceSummary?.account_metrics || {};
  const transactionMetrics = complianceSummary?.transaction_metrics || {};

  const auditStats = [
    { title: 'Total Users', value: userMetrics.total_users || 0, icon: Users, color: 'bg-gradient-to-br from-blue-500 to-blue-600', bgColor: 'from-blue-50 to-blue-100' },
    { title: 'Active Users', value: userMetrics.active_users || 0, icon: UserCheck, color: 'bg-gradient-to-br from-green-500 to-green-600', bgColor: 'from-green-50 to-green-100' },
    { title: 'KYC Verified', value: userMetrics.verified_kyc || 0, icon: Shield, color: 'bg-gradient-to-br from-purple-500 to-purple-600', bgColor: 'from-purple-50 to-purple-100' },
    { title: 'Total Accounts', value: accountMetrics.total_accounts || 0, icon: CreditCard, color: 'bg-gradient-to-br from-indigo-500 to-indigo-600', bgColor: 'from-indigo-50 to-indigo-100' },
    { title: 'Total Transactions', value: transactionMetrics.total_transactions || 0, icon: Activity, color: 'bg-gradient-to-br from-cyan-500 to-cyan-600', bgColor: 'from-cyan-50 to-cyan-100' },
    { title: 'Large Transactions', value: transactionMetrics.large_transactions || 0, icon: AlertTriangle, color: 'bg-gradient-to-br from-orange-500 to-red-500', bgColor: 'from-orange-50 to-red-100' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 p-6">
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
          Audit Overview
        </h1>
        <div className="h-1 w-32 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mx-auto mb-4"></div>
        <p className="text-xl text-gray-600 font-medium">Comprehensive compliance and audit dashboard (Read-Only)</p>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
        {auditStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={`group relative bg-gradient-to-br ${stat.bgColor} backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-white/30 hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:-translate-y-2 cursor-pointer overflow-hidden`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-4 right-4 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
              
              <div className="relative flex items-center">
                <div className={`${stat.color} p-4 rounded-2xl shadow-lg transform group-hover:rotate-12 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="ml-6">
                  <p className="text-sm font-semibold text-gray-600 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-4xl font-bold text-gray-900 mt-1 group-hover:text-gray-800 transition-colors">
                    {stat.value.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </div>
          );
        })}
      </div>

      {/* Enhanced Compliance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 hover:shadow-3xl transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-3 rounded-2xl mr-4">
              <Shield className="w-6 h-6 text-white" />
            </div>
            KYC Compliance
          </h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Compliance Rate</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {userMetrics.kyc_compliance_rate || 0}%
              </span>
            </div>
            <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-1000 ease-out shadow-lg" 
                style={{ width: `${userMetrics.kyc_compliance_rate || 0}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl border border-green-200">
                <div className="text-2xl font-bold text-green-800">{userMetrics.verified_kyc || 0}</div>
                <div className="text-green-600 font-semibold">Verified</div>
                <div className="w-8 h-1 bg-green-500 rounded-full mx-auto mt-2"></div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl border border-orange-200">
                <div className="text-2xl font-bold text-orange-800">{userMetrics.pending_kyc || 0}</div>
                <div className="text-orange-600 font-semibold">Pending</div>
                <div className="w-8 h-1 bg-orange-500 rounded-full mx-auto mt-2"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30 hover:shadow-3xl transition-all duration-300">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-3 rounded-2xl mr-4">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            Transaction Risk
          </h2>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 font-medium">Large Transaction Rate</span>
              <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {transactionMetrics.large_transaction_rate || 0}%
              </span>
            </div>
            <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-1000 ease-out shadow-lg" 
                style={{ width: `${Math.min(transactionMetrics.large_transaction_rate || 0, 100)}%` }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border border-blue-200">
                <div className="text-2xl font-bold text-blue-800">{transactionMetrics.total_transactions || 0}</div>
                <div className="text-blue-600 font-semibold">Total</div>
                <div className="w-8 h-1 bg-blue-500 rounded-full mx-auto mt-2"></div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-100 rounded-2xl border border-orange-200">
                <div className="text-2xl font-bold text-orange-800">{transactionMetrics.large_transactions || 0}</div>
                <div className="text-orange-600 font-semibold">Large (&gt;₹10K)</div>
                <div className="w-8 h-1 bg-orange-500 rounded-full mx-auto mt-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Role Distribution */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/30">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-3 rounded-2xl mr-4">
            <Users className="w-6 h-6 text-white" />
          </div>
          User Role Distribution
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {complianceSummary?.role_distribution?.map((role, index) => {
            const colors = [
              'from-blue-500 to-indigo-500',
              'from-green-500 to-emerald-500', 
              'from-purple-500 to-pink-500',
              'from-orange-500 to-red-500'
            ];
            return (
              <div key={index} className="group text-center p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className={`w-16 h-16 bg-gradient-to-r ${colors[index % colors.length]} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:rotate-12 transition-transform duration-300`}>
                  <span className="text-2xl font-bold text-white">{role.count}</span>
                </div>
                <div className="text-lg font-bold text-gray-900 capitalize">{role.role}</div>
                <div className="text-sm text-gray-500 font-semibold">{role.percentage}% of users</div>
                <div className={`w-full h-2 bg-gradient-to-r ${colors[index % colors.length]} rounded-full mt-3 opacity-20`}></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// New Enhanced Admin Components
export const TransactionOverview = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await getAllTransactions();
        setTransactions(data);
      } catch (error) {
        console.error('Error loading transactions:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, []);

  const filteredTransactions = transactions.filter(txn => 
    !searchTerm || 
    txn.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    txn.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Transaction Overview</h1>
        <p className="text-gray-600">View all system transactions (Read-Only)</p>
      </div>

      {/* Search */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search transactions by user or description..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-blue-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{txn.user_name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      txn.txn_type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {txn.txn_type?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    ₹{parseFloat(txn.amount).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {txn.description || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(txn.txn_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Enhanced Auditor Components
export const AuditorUserAnalysis = () => {
  const [users, setUsers] = useState([]);
  const [userReport, setUserReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [usersData, reportData] = await Promise.all([
          getUsersAudit(),
          getUserActivityReport()
        ]);
        setUsers(usersData);
        setUserReport(reportData);
      } catch (error) {
        console.error('Error loading user analysis:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredUsers = users.filter(user => 
    !searchTerm || 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">User Analysis</h1>
        <p className="text-gray-600">Comprehensive user data analysis for audit purposes</p>
      </div>

      {/* User Registration Trends */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Registration Trends</h2>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {userReport?.monthly_registrations?.slice(-6).map((month, index) => (
            <div key={index} className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-lg font-bold text-blue-800">{month.registrations}</div>
              <div className="text-sm text-blue-600">{month.month}</div>
            </div>
          ))}
        </div>
      </div>

      {/* All Users Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">All Users (Read-Only)</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Accounts</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name || 'N/A'}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' ? 'bg-red-100 text-red-800' :
                      user.role === 'auditor' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'support' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {user.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.kyc_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                    }`}>
                      {user.kyc_status === 'verified' ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.account_count || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    ₹{(user.total_balance || 0).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AuditorTransactionAnalysis = () => {
  const [transactions, setTransactions] = useState([]);
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    txn_type: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [transactionData, patternData] = await Promise.all([
          getTransactionsAudit({ limit: 100, ...filters }),
          getTransactionPatterns()
        ]);
        setTransactions(transactionData.transactions || []);
        setPatterns(patternData);
      } catch (error) {
        console.error('Error loading transaction analysis:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [filters]);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">Transaction Analysis</h1>
        <p className="text-gray-600">Comprehensive transaction data analysis for audit purposes</p>
      </div>

      {/* Transaction Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Transaction Volume (Last 7 Days)</h2>
          <div className="space-y-2">
            {patterns?.daily_patterns?.slice(-7).map((day, index) => (
              <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">{day.date}</span>
                <div className="text-right">
                  <div className="font-semibold text-purple-600">{day.transaction_count} txns</div>
                  <div className="text-xs text-gray-500">₹{day.total_volume.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-blue-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Transaction Type Distribution</h2>
          <div className="space-y-3">
            {patterns?.type_distribution?.map((type, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">{type.type}</span>
                <div className="text-right">
                  <div className="font-semibold text-indigo-600">{type.count}</div>
                  <div className="text-xs text-gray-500">₹{type.total_amount.toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 mb-6 border border-blue-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transaction Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={filters.txn_type}
            onChange={(e) => setFilters({...filters, txn_type: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Transaction Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
          <input
            type="date"
            value={filters.start_date}
            onChange={(e) => setFilters({...filters, start_date: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={filters.end_date}
            onChange={(e) => setFilters({...filters, end_date: e.target.value})}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="End Date"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Recent Transactions (Read-Only)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{txn.user_name}</div>
                      <div className="text-sm text-gray-500">{txn.user_email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      txn.txn_type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {txn.txn_type?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                    ₹{txn.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {txn.category || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {txn.description || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(txn.txn_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const AuditorSystemLogs = () => {
  const [logs, setLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('logs');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [logsData, alertsData] = await Promise.all([
          getSystemLogsAudit(),
          getAlertsAudit()
        ]);
        setLogs(logsData.activities || []);
        setAlerts(alertsData);
      } catch (error) {
        console.error('Error loading system logs:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">System Logs</h1>
        <p className="text-gray-600">Comprehensive system activity logs and alerts for audit purposes</p>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-blue-100 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'logs'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Activity Logs ({logs.length})
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'alerts'
                ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <AlertTriangle className="w-4 h-4 inline mr-2" />
            System Alerts ({alerts.length})
          </button>
        </div>

        <div className="p-6 max-h-96 overflow-y-auto">
          {activeTab === 'logs' && (
            <div className="space-y-3">
              {logs.map((log, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          log.type === 'user_registration' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {log.type.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="ml-2 text-sm font-medium text-gray-900">{log.user_name}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{log.details}</p>
                      <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          {alert.type}
                        </span>
                        <span className="ml-2 text-sm font-medium text-gray-900">{alert.user_name}</span>
                      </div>
                      <p className="text-sm text-gray-700 mb-1">{alert.message}</p>
                      <p className="text-xs text-gray-500">{new Date(alert.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      alert.is_read ? 'bg-gray-100 text-gray-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {alert.is_read ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};