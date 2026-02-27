import { useState, useEffect } from 'react';
import { CreditCard, Search, Filter, Download, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/admin';

const AccountsAudit = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const accountsData = await adminApi.getAllAccounts();
      setAccounts(accountsData || []);
    } catch (error) {
      console.error('Failed to load accounts:', error);
      // Mock data
      setAccounts([
        { id: 1, user_id: 1, account_number: '****1234', account_type: 'savings', balance: 5000, is_active: true },
        { id: 2, user_id: 2, account_number: '****5678', account_type: 'checking', balance: 2500, is_active: true }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAccounts = accounts.filter(account => {
    if (filter !== 'all' && account.account_type !== filter) return false;
    if (searchTerm && !account.account_number?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
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
            Accounts Audit
          </h1>
          <p className="text-gray-600">Read-only access to all bank accounts</p>
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
                <option value="all">All Types</option>
                <option value="savings">Savings</option>
                <option value="checking">Checking</option>
                <option value="business">Business</option>
              </select>
            </div>
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search accounts..."
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
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Account Number</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Balance</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">User ID</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAccounts.map(account => (
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
        </div>
      </div>
    </div>
  );
};

export default AccountsAudit;