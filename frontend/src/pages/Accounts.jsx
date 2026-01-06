import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CreditCard, Trash2, Eye, EyeOff, Hash } from 'lucide-react';
import Navbar from '../components/Navbar';
import Table from '../components/Table';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { getAccounts, createAccount, deleteAccount } from '../api/accounts';
import { createAlert } from '../api/alerts';
import NotificationService from '../services/NotificationService';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [visibleBalances, setVisibleBalances] = useState(new Set());
  
  const [formData, setFormData] = useState({
    name: '',
    account_number: '',
    type: 'checking',
    balance: '',
    status: 'active'
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAccounts();
      setAccounts(data);
    } catch (err) {
      console.error('Failed to fetch accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateAccountNumber = () => {
    return Math.floor(1000000000 + Math.random() * 9000000000).toString();
  };

  const handleOpenModal = () => {
    setFormData({
      name: '',
      account_number: generateAccountNumber(),
      type: 'checking',
      balance: '',
      status: 'active'
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const accountToDelete = accounts.find(acc => acc.id === id);
    const confirmMessage = `Are you sure you want to delete "${accountToDelete?.name || 'this account'}"?\n\nWarning: This will also delete all transactions associated with this account. This action cannot be undone.`;
    
    if (window.confirm(confirmMessage)) {
      try {
        const result = await deleteAccount(id);
        
        // Show success message
        if (result && result.transactions_deleted > 0) {
          alert(`Account deleted successfully (including ${result.transactions_deleted} transaction(s))`);
        }
        
        await fetchAccounts();
      } catch (err) {
        console.error('Failed to delete account:', err);
        const errorMessage = err.response?.data?.detail || 'Failed to delete account';
        alert(errorMessage);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      /** * ✅ CRITICAL FIX: The payload keys MUST match your 
       * FastAPI 'AccountCreate' schema exactly.
       */
      const payload = {
        name: formData.name,            // Backend: name
        account_type: formData.type,    // Backend: account_type
        bank_name: "Asunova Bank",      // Backend: bank_name
        balance: parseFloat(formData.balance) || 0.0
      };

      console.log("🚀 Sending Payload to Backend:", payload); 

      await createAccount(payload);
      
      // Create an alert for successful account creation and show a push notification
      const title = 'Account Created';
      const message = `${payload.name} connected successfully (${payload.bank_name})`;
      try {
        await createAlert(title, message, 'info');
        NotificationService.showNotification(title, { body: message });
        window.dispatchEvent(new CustomEvent('alertsUpdated'));
      } catch (e) {
        // If alert creation fails, just log it and continue
        console.warn('Failed to create alert for account creation:', e);
      }

      // Success actions
      await fetchAccounts();
      setIsModalOpen(false);
      
    } catch (err) {
      console.error("❌ Submission Error:", err);
      let msg = "Failed to create account";
      
      // Extract detailed error from FastAPI Pydantic validation
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        msg = Array.isArray(detail) 
          ? detail.map(d => `${d.loc[1]}: ${d.msg}`).join(', ') 
          : String(detail);
      }
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleBalanceVisibility = (accountId) => {
    setVisibleBalances(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accountId)) {
        newSet.delete(accountId);
      } else {
        newSet.add(accountId);
      }
      return newSet;
    });
  };

  const generateAccountHash = (accountId) => {
    return `#${accountId.toString().padStart(6, '0')}`;
  };

  const headers = ['Account Name', 'Account Number', 'Type', 'Balance', 'Status', 'Actions'];

  const renderRow = (account) => (
    <tr 
      key={account.id} 
      onClick={() => navigate(`/app/accounts/${account.id}`)}
      className="hover:bg-gray-50 cursor-pointer transition-colors"
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-100 text-sky-600 rounded-lg">
            <CreditCard size={20} />
          </div>
          <span className="font-medium text-gray-900">{account.name}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-600 font-mono">
        {account.masked_account || `**** ${account.account_number?.slice(-4) || '0000'}`}
      </td>
      <td className="px-6 py-4 text-gray-600 capitalize">
        {(() => {
          const t = account.account_type || account.type || '';
          return t.replace(/_/g, ' ').split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
        })()}
      </td>
      <td className="px-6 py-4 font-medium text-gray-900">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono">{generateAccountHash(account.id)}</span>
          {visibleBalances.has(account.id) ? (
            <span>₹{parseFloat(account.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          ) : (
            <span>₹****.**</span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleBalanceVisibility(account.id);
            }}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title={visibleBalances.has(account.id) ? 'Hide balance' : 'Show balance'}
          >
            {visibleBalances.has(account.id) ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          account.is_active || account.status === 'active' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-700'
        }`}>
          {account.is_active === false ? 'Inactive' : 'Active'}
        </span>
      </td>
      <td className="px-6 py-4">
        <button
          onClick={(e) => handleDelete(e, account.id)}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete Account"
        >
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <Navbar title="Accounts" />
      
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Your Bank Accounts</h2>
          <button 
            onClick={handleOpenModal} 
            className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-shadow shadow-md active:scale-95"
          >
            <Plus size={20} />
            <span>Add Account</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {accounts.length > 0 ? (
            <Table 
              headers={headers}
              data={accounts}
              renderRow={renderRow}
            />
          ) : (
            <div className="p-12 text-center text-gray-500">
              <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No accounts found.</p>
              <p className="text-sm">Click "Add Account" to connect your first bank account.</p>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Connect New Account"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 outline-none"
              placeholder="e.g. Personal Savings"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Number <span className="text-xs text-sky-600">(Auto-Generated)</span>
            </label>
            <input
              type="text"
              name="account_number"
              value={formData.account_number}
              readOnly
              className="w-full px-4 py-2 bg-gray-50 text-gray-500 border border-gray-200 rounded-lg font-mono tracking-widest"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 bg-white outline-none"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="credit_card">Credit Card</option>
              <option value="investment">Investment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Starting Balance (₹)</label>
            <input
              type="number"
              name="balance"
              value={formData.balance}
              onChange={handleInputChange}
              required
              step="0.01"
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-700 disabled:bg-sky-300 transition-all shadow-md"
            >
              {submitting ? 'Processing...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Accounts;