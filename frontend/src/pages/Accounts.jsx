import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Building2, CreditCard, DollarSign, X, Save } from 'lucide-react';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../api/accounts';
import toast from 'react-hot-toast';

export default function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    bank_name: '',
    account_type: 'Savings',
    masked_account: '',
    currency: 'USD',
    balance: '0.00'
  });

  const accountTypes = ['Savings', 'Checking', 'Credit Card', 'Investment', 'Loan'];
  const currencies = ['USD', 'EUR', 'GBP', 'INR', 'JPY', 'AUD', 'CAD'];

  useEffect(() => {
    fetchAccounts();
  }, []);


  async function fetchAccounts() {
    try {
      setLoading(true);
      const data = await getAccounts();
      setAccounts(data);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: '' });
  }

  function validateForm() {
    const newErrors = {};

    if (!form.bank_name.trim()) {
      newErrors.bank_name = 'Bank name is required';
    }

    if (!form.account_type) {
      newErrors.account_type = 'Account type is required';
    }

    if (form.masked_account && !/^\d{4}$/.test(form.masked_account)) {
      newErrors.masked_account = 'Must be 4 digits (e.g., 1234)';
    }

    if (form.balance && isNaN(parseFloat(form.balance))) {
      newErrors.balance = 'Must be a valid number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const payload = {
      bank_name: form.bank_name.trim(),
      account_type: form.account_type,
      masked_account: form.masked_account.trim() || "0000",
      currency: form.currency,
      balance: Number(form.balance),
    };

    try {
      setLoading(true);
      
      if (editMode) {
        await updateAccount(currentAccount.id, payload);
        toast.success('Account updated successfully!');
      } else {
        await createAccount(payload);
        toast.success('Account created successfully!');
      }
      
      await fetchAccounts();
      closeModal();
    } catch (error) {
      console.error('Error saving account:', error);
      const errorMessage = typeof error === 'string' ? error : error?.detail || 'Failed to save account';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }
      
  function confirmDelete(onConfirm) {
    toast.custom((t) => (
      <div className="bg-white rounded-xl shadow-lg p-4 w-80">
        <p className="text-gray-800 font-medium mb-4">
          Are you sure you want to delete this account?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              toast.dismiss(t.id);
              onConfirm();
            }}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  }

  async function handleDelete(accountId) {
  confirmDelete(async () => {
    try {
      setLoading(true);
      await deleteAccount(accountId);
      toast.success("Account deleted successfully!");
      await fetchAccounts();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    } finally {
      setLoading(false);
    }
  });
}


  function openAddModal() {
    setEditMode(false);
    setCurrentAccount(null);
    setForm({
      bank_name: '',
      account_type: 'Savings',
      masked_account: '',
      currency: 'USD',
      balance: '0.00'
    });
    setErrors({});
    setShowModal(true);
  }

  function openEditModal(account) {
    setEditMode(true);
    setCurrentAccount(account);
    setForm({
      bank_name: account.bank_name,
      account_type: account.account_type,
      masked_account: account.masked_account || '',
      currency: account.currency,
      balance: account.balance.toString()
    });
    setErrors({});
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditMode(false);
    setCurrentAccount(null);
    setForm({
      bank_name: '',
      account_type: 'Savings',
      masked_account: '',
      currency: 'USD',
      balance: '0.00'
    });
    setErrors({});
  }

  const getAccountColor = (type) => {
    const colors = {
      'Savings': 'from-blue-500 to-blue-600',
      'Checking': 'from-green-500 to-green-600',
      'Credit Card': 'from-purple-500 to-purple-600',
      'Investment': 'from-orange-500 to-orange-600',
      'Loan': 'from-red-500 to-red-600'
    };
    return colors[type] || 'from-gray-500 to-gray-600';
  };

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Accounts</h1>
            <p className="text-gray-600 mt-1">Manage your bank accounts</p>
          </div>
          <button
            onClick={openAddModal}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium flex items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            Add Account
          </button>
        </div>

        {loading && accounts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading accounts...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Accounts Yet</h3>
            <p className="text-gray-600 mb-6">Add your first bank account to get started</p>
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium inline-flex items-center gap-2 hover:bg-blue-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              Add Your First Account
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all"
              >
                <div className={`bg-gradient-to-r ${getAccountColor(account.account_type)} p-6 text-white`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm opacity-90 mb-1">{account.account_type}</div>
                      <div className="text-2xl font-bold">{account.bank_name}</div>
                    </div>
                    <CreditCard className="w-8 h-8 opacity-80" />
                  </div>
                  {account.masked_account && (
                    <div className="text-sm opacity-90">•••• {account.masked_account}</div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">Balance</div>
                    <div className="text-sm text-gray-500">{account.currency}</div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-6">
                    {parseFloat(account.balance).toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => openEditModal(account)}
                      disabled={loading}
                      className="flex-1 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      disabled={loading}
                      className="flex-1 py-2 border-2 border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                    Created: {new Date(account.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editMode ? 'Edit Account' : 'Add New Account'}
                </h2>
                <button
                  onClick={closeModal}
                  disabled={loading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bank Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                      name="bank_name"
                      type="text"
                      placeholder="Chase Bank"
                      value={form.bank_name}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  {errors.bank_name && (
                    <p className="text-red-500 text-sm mt-1">{errors.bank_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Account Type *
                  </label>
                  <select
                    name="account_type"
                    value={form.account_type}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {accountTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.account_type && (
                    <p className="text-red-500 text-sm mt-1">{errors.account_type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last 4 Digits (Optional)
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                      name="masked_account"
                      type="text"
                      placeholder="1234"
                      maxLength="4"
                      value={form.masked_account}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  {errors.masked_account && (
                    <p className="text-red-500 text-sm mt-1">{errors.masked_account}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    name="currency"
                    value={form.currency}
                    onChange={handleChange}
                    disabled={loading}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {currencies.map((curr) => (
                      <option key={curr} value={curr}>{curr}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Balance
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                      name="balance"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={form.balance}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  {errors.balance && (
                    <p className="text-red-500 text-sm mt-1">{errors.balance}</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={loading}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        {editMode ? 'Update' : 'Create'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}