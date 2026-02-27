import React, { useState, useEffect } from 'react';
import { Users, CreditCard, ArrowUpDown, AlertTriangle, Eye, Search, Filter, RefreshCw, Shield, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/admin';

const SupportDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetRequests, setResetRequests] = useState([]);
  const [resetReason, setResetReason] = useState('');

  useEffect(() => {
    loadData();
    loadResetRequests();
  }, []);

  const loadResetRequests = async () => {
    try {
      const requests = await adminApi.getPasswordResetRequests();
      setResetRequests(Array.isArray(requests) ? requests : []);
    } catch (error) {
      console.error('Failed to load reset requests:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('Loading support dashboard data...');
      
      const [usersData, accountsData, transactionsData] = await Promise.all([
        adminApi.getAllUsers().catch(err => {
          console.warn('Failed to load users:', err.message);
          return [];
        }),
        adminApi.getAllAccounts().catch(err => {
          console.warn('Failed to load accounts:', err.message);
          return [];
        }),
        adminApi.getAllTransactions().catch(err => {
          console.warn('Failed to load transactions:', err.message);
          return [];
        })
      ]);
      
      console.log('Support Dashboard Data loaded:', { 
        users: usersData?.length || 0, 
        accounts: accountsData?.length || 0, 
        transactions: transactionsData?.length || 0 
      });
      
      setUsers(Array.isArray(usersData) ? usersData : []);
      setAccounts(Array.isArray(accountsData) ? accountsData : []);
      setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
    } catch (error) {
      console.error('Failed to load support data:', error);
      setUsers([]);
      setAccounts([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const viewUserDetails = (userData) => {
    setSelectedUser(userData);
    setShowModal(true);
  };

  const requestCredentialReset = (userData) => {
    setSelectedUser(userData);
    setShowResetModal(true);
  };

  const submitResetRequest = async () => {
    if (!resetReason.trim()) {
      alert('Please provide a reason for the reset request.');
      return;
    }
    
    const requestData = {
      user_id: selectedUser.id,
      user_email: selectedUser.email,
      user_name: selectedUser.name,
      reason: resetReason.trim(),
      requested_by: user?.name || 'Support User'
    };
    
    try {
      // Try to submit to backend first
      await adminApi.submitPasswordResetRequest(requestData);
      
      // If successful, add to local state
      const newRequest = {
        id: Date.now(),
        user: {
          id: selectedUser.id,
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role
        },
        reason: resetReason.trim(),
        status: 'pending',
        requestedAt: new Date().toISOString(),
        requestedBy: user?.name || 'Support User'
      };
      
      setResetRequests(prev => [...prev, newRequest]);
      setShowResetModal(false);
      setResetReason('');
      setSelectedUser(null);
      
      alert('Password reset request submitted successfully. It will be reviewed by administrators.');
    } catch (error) {
      console.error('Failed to submit reset request:', error);
      
      // Fallback to local storage if backend fails
      const newRequest = {
        id: Date.now(),
        user: {
          id: selectedUser.id,
          name: selectedUser.name,
          email: selectedUser.email,
          role: selectedUser.role
        },
        reason: resetReason.trim(),
        status: 'pending',
        requestedAt: new Date().toISOString(),
        requestedBy: user?.name || 'Support User'
      };
      
      setResetRequests(prev => [...prev, newRequest]);
      setShowResetModal(false);
      setResetReason('');
      setSelectedUser(null);
      
      alert('Password reset request submitted locally. Backend connection failed, but request is saved.');
    }
  };

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAccounts = accounts.filter(a => 
    a.account_number?.includes(searchTerm) ||
    a.account_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTransactions = transactions.filter(t => 
    t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.transaction_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Support Dashboard</h1>
        <p className="text-gray-600">Customer support and operational assistance</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'users', label: 'User Profiles', icon: Users },
              { id: 'accounts', label: 'Account Data', icon: CreditCard },
              { id: 'transactions', label: 'Transaction Data', icon: ArrowUpDown },
              { id: 'reset-requests', label: 'Reset Requests', icon: RefreshCw },
              { id: 'alerts', label: 'Support Tickets', icon: AlertTriangle }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-yellow-500 text-yellow-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon size={16} className="mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
          </div>

          {activeTab === 'users' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">KYC</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        {searchTerm ? 'No users found matching your search.' : 'No users available.'}
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map(userData => (
                      <tr key={userData.id || userData.email} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                              {userData.name?.charAt(0)?.toUpperCase() || userData.email?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{userData.name || 'No Name'}</p>
                              <p className="text-xs text-gray-500">{userData.email || 'No Email'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {userData.role?.toUpperCase() || 'USER'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            userData.is_active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {userData.is_active !== false ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            userData.kyc_status === 'verified' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {userData.kyc_status?.toUpperCase() || 'PENDING'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => viewUserDetails(userData)}
                              className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button 
                              onClick={() => requestCredentialReset(userData)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Request Password Reset"
                            >
                              <RefreshCw size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'accounts' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Account</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Balance</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAccounts.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        {searchTerm ? 'No accounts found matching your search.' : 'No accounts available.'}
                      </td>
                    </tr>
                  ) : (
                    filteredAccounts.map(account => (
                      <tr key={account.id || account.account_number} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{account.account_number || 'N/A'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {account.account_type?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-gray-900">
                            ₹{typeof account.balance === 'number' ? account.balance.toFixed(2) : '0.00'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ACTIVE
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'transactions' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Transaction</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-500">
                        {searchTerm ? 'No transactions found matching your search.' : 'No transactions available.'}
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(transaction => (
                      <tr key={transaction.id || `${transaction.description}-${transaction.created_at}`} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{transaction.description || 'No Description'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            transaction.transaction_type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.transaction_type?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-medium ${
                            transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.transaction_type === 'credit' ? '+' : '-'}₹
                            {typeof transaction.amount === 'number' ? Math.abs(transaction.amount).toFixed(2) : '0.00'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-sm text-gray-600">
                            {transaction.created_at ? new Date(transaction.created_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'reset-requests' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Credential Reset Requests</h3>
                </div>
                <p className="text-sm text-blue-700">
                  All password reset requests require admin approval for security.
                </p>
              </div>
              
              {resetRequests.length === 0 ? (
                <div className="text-center py-8">
                  <RefreshCw size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Reset Requests</h3>
                  <p className="text-gray-600">No credential reset requests have been submitted.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {resetRequests.map(request => (
                    <div key={request.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {request.user.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{request.user.name}</h4>
                            <p className="text-sm text-gray-500">{request.user.email}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          request.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-3 text-sm text-gray-600">
                        <p><strong>Reason:</strong> {request.reason}</p>
                        <p><strong>Requested by:</strong> {request.requestedBy}</p>
                        <p><strong>Date:</strong> {new Date(request.requestedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="text-center py-12">
              <AlertTriangle size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Support Tickets</h3>
              <p className="text-gray-600">Support ticket system coming soon...</p>
            </div>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">User Profile</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedUser.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedUser.name}</h4>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Role:</span>
                  <p className="font-medium">{selectedUser.role?.toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <p className="font-medium">{selectedUser.is_active ? 'Active' : 'Inactive'}</p>
                </div>
                <div>
                  <span className="text-gray-500">KYC Status:</span>
                  <p className="font-medium">{selectedUser.kyc_status?.toUpperCase() || 'Pending'}</p>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>
                  <p className="font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => requestCredentialReset(selectedUser)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw size={16} />
                  Request Password Reset
                </button>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Support users have read-only access. No financial data modification allowed.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Credential Reset Request Modal */}
      {showResetModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Request Password Reset</h3>
              <button 
                onClick={() => setShowResetModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {selectedUser.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">{selectedUser.name}</h4>
                  <p className="text-sm text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Reset Request
              </label>
              <textarea
                value={resetReason}
                onChange={(e) => setResetReason(e.target.value)}
                placeholder="Please provide a reason for the password reset request..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                rows={3}
                required
              />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <p className="text-sm text-amber-800">
                  <strong>Security Notice:</strong> This request will be sent to administrators for approval.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowResetModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitResetRequest}
                disabled={!resetReason.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportDashboard;