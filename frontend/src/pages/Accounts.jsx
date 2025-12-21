import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CreditCard, Trash2 } from 'lucide-react';
// 1. REMOVED Navbar Import
import Table from '../components/Table';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { getAccounts, createAccount, deleteAccount } from '../api/accounts';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
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
      const data = await getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); 
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteAccount(id);
        await fetchAccounts();
      } catch (error) {
        console.error('Failed to delete account:', error);
        alert('Failed to delete account');
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
      await createAccount({
        ...formData,
        balance: parseFloat(formData.balance) || 0
      });
      await fetchAccounts();
      setIsModalOpen(false);
      setFormData({
        name: '',
        account_number: '',
        type: 'checking',
        balance: '',
        status: 'active'
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const headers = ['Account Name', 'Account Number', 'Type', 'Balance', 'Status', 'Actions'];

  const renderRow = (account) => (
    <tr 
      key={account.id} 
      onClick={() => navigate(`/accounts/${account.id}`)}
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
      <td className="px-6 py-4 text-gray-600">**** {account.account_number?.slice(-4)}</td>
      <td className="px-6 py-4 text-gray-600 capitalize">{account.type}</td>
      <td className="px-6 py-4 font-medium text-gray-900">₹{account.balance?.toLocaleString()}</td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          account.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
        }`}>
          {account.status}
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
    // 2. CLEAN LAYOUT: Just spacing, no double header
    <div className="space-y-6">
      
      {/* 3. Header Action Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Your Accounts</h2>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>Add Account</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {accounts.length > 0 ? (
          <Table 
            headers={headers}
            data={accounts}
            renderRow={renderRow}
          />
        ) : (
          <div className="p-12 text-center text-gray-500 bg-gray-50">
            <div className="mb-3 inline-block p-3 bg-white rounded-full shadow-sm">
               <CreditCard size={24} className="text-gray-400" />
            </div>
            <p>No accounts found. Add one to get started!</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add New Account"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              placeholder="e.g. Main Checking"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
            <input
              type="text"
              name="account_number"
              value={formData.account_number}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              placeholder="e.g. 1234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all bg-white"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="credit">Credit Card</option>
              <option value="investment">Investment</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Balance</label>
            <input
              type="number"
              name="balance"
              value={formData.balance}
              onChange={handleInputChange}
              required
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
              placeholder="0.00"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50 shadow-sm"
            >
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Accounts;