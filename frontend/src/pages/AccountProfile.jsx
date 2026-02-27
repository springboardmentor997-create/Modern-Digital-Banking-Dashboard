import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import { getAccounts } from '../api/accounts';
import { getTransactions } from '../api/transactions';

const AccountProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccountData();
  }, [id]);

  const fetchAccountData = async () => {
    try {
      setLoading(true);
      const [accountsData, transactionsData] = await Promise.all([
        getAccounts(),
        getTransactions()
      ]);
      
      const currentAccount = accountsData.find(acc => acc.id === parseInt(id));
      const accountTransactions = transactionsData.filter(txn => txn.account_id === parseInt(id));
      
      setAccount(currentAccount);
      setTransactions(accountTransactions);
    } catch (err) {
      console.error('Failed to fetch account data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
        <Navbar title="Account Not Found" />
        <div className="p-6 text-center">
          <p className="text-gray-600">Account not found.</p>
          <button 
            onClick={() => navigate('/app/accounts')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Accounts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <Navbar title={account.name} />
      
      <div className="p-6 max-w-7xl mx-auto">
        <button 
          onClick={() => navigate('/app/accounts')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Accounts
        </button>

        {/* Account Details Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
              <CreditCard size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
              <p className="text-gray-600 font-mono">
                {account.masked_account || `**** ${account.account_number?.slice(-4) || '0000'}`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl">
              <h3 className="text-sm font-medium text-green-700 mb-1">Current Balance</h3>
              <p className="text-2xl font-bold text-green-800">
                ₹{parseFloat(account.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl">
              <h3 className="text-sm font-medium text-blue-700 mb-1">Account Type</h3>
              <p className="text-xl font-semibold text-blue-800 capitalize">
                {account.account_type || account.type}
              </p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl">
              <h3 className="text-sm font-medium text-purple-700 mb-1">Status</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                account.is_active || account.status === 'active' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {account.is_active === false ? 'Inactive' : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Transactions</h2>
          
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      transaction.txn_type === 'credit' || transaction.type === 'credit'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {transaction.txn_type === 'credit' || transaction.type === 'credit' ? (
                        <TrendingUp size={20} />
                      ) : (
                        <TrendingDown size={20} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`text-right ${
                    transaction.txn_type === 'credit' || transaction.type === 'credit'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                    <p className="font-bold">
                      {transaction.txn_type === 'credit' || transaction.type === 'credit' ? '+' : '-'}
                      ₹{parseFloat(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions found for this account.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountProfile;