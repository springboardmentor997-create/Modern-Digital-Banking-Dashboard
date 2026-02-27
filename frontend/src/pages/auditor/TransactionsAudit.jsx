import { useState, useEffect } from 'react';
import { ArrowUpDown, Search, Filter, Download, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/admin';

const TransactionsAudit = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const transactionsData = await adminApi.getAllTransactions();
      setTransactions(transactionsData || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      // Mock data
      setTransactions([
        { id: 1, user_id: 1, amount: 1000, transaction_type: 'credit', description: 'Salary', transaction_date: new Date().toISOString(), status: 'completed' },
        { id: 2, user_id: 2, amount: 250, transaction_type: 'debit', description: 'ATM withdrawal', transaction_date: new Date(Date.now() - 3600000).toISOString(), status: 'completed' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter !== 'all' && transaction.transaction_type !== filter) return false;
    if (searchTerm && !transaction.description?.toLowerCase().includes(searchTerm.toLowerCase())) return false;
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
            Transactions Audit
          </h1>
          <p className="text-gray-600">Read-only access to all transactions</p>
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
                <option value="credit">Credits</option>
                <option value="debit">Debits</option>
                <option value="transfer">Transfers</option>
              </select>
            </div>
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <Search size={16} className="text-gray-500" />
              <input
                type="text"
                placeholder="Search transactions..."
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
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Type</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Description</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">User ID</th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTransactions.map(transaction => (
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
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                        transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {transaction.status?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm">{transaction.user_id}</span>
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

export default TransactionsAudit;