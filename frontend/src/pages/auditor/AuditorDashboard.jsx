import { useState, useEffect } from 'react';
import { Users, CreditCard, ArrowUpDown, FileText, Eye, Search, Filter, Download, Calendar, TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/admin';

const AuditorDashboard = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user?.role === 'auditor' || user?.role === 'admin') {
      loadAuditData();
    }
  }, [user]);

  const loadAuditData = async () => {
    try {
      const [usersData, accountsData, transactionsData, logsData] = await Promise.all([
        adminApi.getAllUsers(),
        adminApi.getAllAccounts(),
        adminApi.getAllTransactions(),
        adminApi.getSystemLogs()
      ]);
      
      setUsers(usersData || []);
      setAccounts(accountsData || []);
      setTransactions(transactionsData || []);
      setLogs(logsData || []);
    } catch (error) {
      console.error('Failed to load audit data:', error);
      // Mock data for demo
      setUsers([
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', is_active: true, kyc_status: 'verified', created_at: new Date().toISOString() },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', is_active: true, kyc_status: 'pending', created_at: new Date(Date.now() - 86400000).toISOString() }
      ]);
      setAccounts([
        { id: 1, user_id: 1, account_number: '****1234', account_type: 'savings', balance: 5000, is_active: true },
        { id: 2, user_id: 2, account_number: '****5678', account_type: 'checking', balance: 2500, is_active: true }
      ]);
      setTransactions([
        { id: 1, user_id: 1, amount: 1000, transaction_type: 'credit', description: 'Salary', transaction_date: new Date().toISOString(), status: 'completed' },
        { id: 2, user_id: 2, amount: 250, transaction_type: 'debit', description: 'ATM withdrawal', transaction_date: new Date(Date.now() - 3600000).toISOString(), status: 'completed' }
      ]);
      setLogs([
        { id: 1, action: 'User login', user_id: 1, timestamp: new Date().toISOString(), level: 'info', ip_address: '192.168.1.1' },
        { id: 2, action: 'Transaction created', user_id: 2, timestamp: new Date(Date.now() - 1800000).toISOString(), level: 'info', ip_address: '192.168.1.2' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const auditStats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.is_active).length,
    totalAccounts: accounts.length,
    totalTransactions: transactions.length,
    totalBalance: accounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0),
    recentLogs: logs.length
  };

  const getFilteredData = () => {
    switch (activeTab) {
      case 'users':
        return users.filter(userData => {
          if (filter !== 'all' && userData.role !== filter) return false;
          if (searchTerm && !userData.name?.toLowerCase().includes(searchTerm.toLowerCase()) && 
              !userData.email?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
          return true;
        });
      case 'accounts':
        return accounts.filter(account => {
          if (filter !== 'all' && account.account_type !== filter) return false;
          if (searchTerm && !account.account_number?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
          return true;
        });
      case 'transactions':
        return transactions.filter(transaction => {
          if (filter !== 'all' && transaction.transaction_type !== filter) return false;
          if (searchTerm && !transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
          return true;
        });
      case 'logs':
        return logs.filter(log => {
          if (filter !== 'all' && log.level !== filter) return false;
          if (searchTerm && !log.action?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
          return true;
        });
      default:
        return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audit dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Audit Dashboard
          </h1>
          <p className="text-gray-600">Read-only access for compliance and audit reviews</p>
        </div>

        {/* Audit Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3">
              <Users className="text-blue-600" size={20} />
              <div>
                <p className="text-xs text-gray-500">Total Users</p>
                <p className="text-xl font-bold text-gray-900">{auditStats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3">
              <Users className="text-green-600" size={20} />
              <div>
                <p className="text-xs text-gray-500">Active Users</p>
                <p className="text-xl font-bold text-green-600">{auditStats.activeUsers}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3">
              <CreditCard className="text-purple-600" size={20} />
              <div>
                <p className="text-xs text-gray-500">Accounts</p>
                <p className="text-xl font-bold text-purple-600">{auditStats.totalAccounts}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3">
              <ArrowUpDown className="text-orange-600" size={20} />
              <div>
                <p className="text-xs text-gray-500">Transactions</p>
                <p className="text-xl font-bold text-orange-600">{auditStats.totalTransactions}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">₹</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Balance</p>
                <p className="text-xl font-bold text-red-600">₹{auditStats.totalBalance.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-blue-100">
            <div className="flex items-center gap-3">
              <FileText className="text-gray-600" size={20} />
              <div>
                <p className="text-xs text-gray-500">System Logs</p>
                <p className="text-xl font-bold text-gray-600">{auditStats.recentLogs}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 mb-6">
          <div className="flex border-b border-gray-200 overflow-x-auto">
            {[
              { key: 'overview', label: 'Overview', icon: FileText },
              { key: 'users', label: 'Users Audit', icon: Users },
              { key: 'accounts', label: 'Accounts Audit', icon: CreditCard },
              { key: 'transactions', label: 'Transactions Audit', icon: ArrowUpDown },
              { key: 'logs', label: 'System Logs', icon: FileText }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Filters */}
          {activeTab !== 'overview' && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Search size={16} className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-64"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter size={16} className="text-gray-500" />
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  >
                    {activeTab === 'users' && (
                      <>
                        <option value="all">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                        <option value="support">Support</option>
                        <option value="auditor">Auditor</option>
                      </>
                    )}
                    {activeTab === 'accounts' && (
                      <>
                        <option value="all">All Types</option>
                        <option value="savings">Savings</option>
                        <option value="checking">Checking</option>
                        <option value="business">Business</option>
                      </>
                    )}
                    {activeTab === 'transactions' && (
                      <>
                        <option value="all">All Types</option>
                        <option value="credit">Credits</option>
                        <option value="debit">Debits</option>
                        <option value="transfer">Transfers</option>
                      </>
                    )}
                    {activeTab === 'logs' && (
                      <>
                        <option value="all">All Levels</option>
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="error">Error</option>
                      </>
                    )}
                  </select>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
                  <Download size={16} />
                  <span>Export</span>
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent User Activity</h3>
                  <div className="space-y-3">
                    {users.slice(0, 5).map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Transactions</h3>
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map(transaction => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.transaction_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`font-semibold ${
                          transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.transaction_type === 'credit' ? '+' : '-'}₹{parseFloat(transaction.amount).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">User</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Role</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">KYC</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Created</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getFilteredData().map(userData => (
                      <tr key={userData.id} className="hover:bg-gray-50/50">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {userData.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{userData.name}</p>
                              <p className="text-xs text-gray-500">{userData.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            userData.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                            userData.role === 'support' ? 'bg-blue-100 text-blue-800' :
                            userData.role === 'auditor' ? 'bg-orange-100 text-orange-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {userData.role?.toUpperCase() || 'USER'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            userData.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {userData.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            userData.kyc_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {userData.kyc_status?.toUpperCase() || 'UNVERIFIED'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-600">
                            {new Date(userData.created_at).toLocaleDateString()}
                          </span>
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
            )}

            {activeTab === 'accounts' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Account Number</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Type</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Balance</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">User ID</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getFilteredData().map(account => (
                      <tr key={account.id} className="hover:bg-gray-50/50">
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm font-semibold">{account.account_number}</span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            account.account_type === 'savings' ? 'bg-green-100 text-green-800' :
                            account.account_type === 'checking' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {account.account_type?.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-semibold text-gray-900">
                            ₹{parseFloat(account.balance || 0).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            account.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {account.is_active ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm">{account.user_id}</span>
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
            )}

            {activeTab === 'transactions' && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">ID</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Type</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Description</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {getFilteredData().map(transaction => (
                      <tr key={transaction.id} className="hover:bg-gray-50/50">
                        <td className="py-4 px-4">
                          <span className="font-mono text-sm">#{transaction.id}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            {transaction.transaction_type === 'credit' ? (
                              <TrendingUp size={16} className="text-green-600" />
                            ) : (
                              <TrendingDown size={16} className="text-red-600" />
                            )}
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              transaction.transaction_type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {transaction.transaction_type?.toUpperCase()}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`font-semibold ${
                            transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.transaction_type === 'credit' ? '+' : '-'}₹{parseFloat(transaction.amount).toLocaleString()}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className="text-sm text-gray-700">{transaction.description}</span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm text-gray-600">
                            <div>{new Date(transaction.transaction_date).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-400">
                              {new Date(transaction.transaction_date).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {transaction.status?.toUpperCase()}
                          </span>
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
            )}

            {activeTab === 'logs' && (
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
                    {getFilteredData().map(log => (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditorDashboard;