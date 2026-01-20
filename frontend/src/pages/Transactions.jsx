import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Filter, Download, Upload, FileText, Eye, CreditCard } from 'lucide-react';
import axiosClient from '../api/client';
import Navbar from '../components/Navbar';
import CurrencyConverter from '../components/CurrencyConverter';
import { createAlert } from '../api/alerts';
import NotificationService from '../services/NotificationService';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [filters, setFilters] = useState({
    account_id: '',
    category: '',
    transaction_type: '',
    date_from: '',
    date_to: ''
  });

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    txn_type: 'debit',
    category: '',
    merchant: '',
    account_id: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.account_id) params.append('account_id', filters.account_id);
      if (filters.category) params.append('category', filters.category);
      if (filters.transaction_type) params.append('transaction_type', filters.transaction_type);
      
      const queryString = params.toString();
      const transactionUrl = queryString ? `/api/transactions/?${queryString}` : '/api/transactions/';
      
      const [transactionsRes, accountsRes] = await Promise.all([
        axiosClient.get(transactionUrl),
        axiosClient.get('/api/accounts/')
      ]);
      
      console.log('✅ Response: 200 /api/transactions/', transactionsRes.data);
      console.log('✅ Response: 200 /api/accounts/', accountsRes.data);
      
      let filteredTransactions = Array.isArray(transactionsRes.data) ? transactionsRes.data : [];
      
      if (filters.date_from || filters.date_to) {
        filteredTransactions = filteredTransactions.filter(transaction => {
          const txnDate = new Date(transaction.txn_date);
          const fromDate = filters.date_from ? new Date(filters.date_from) : null;
          const toDate = filters.date_to ? new Date(filters.date_to) : null;
          
          if (fromDate && txnDate < fromDate) return false;
          if (toDate && txnDate > toDate) return false;
          return true;
        });
      }
      
      setTransactions(filteredTransactions);
      setAccounts(Array.isArray(accountsRes.data) ? accountsRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data from server');
      setTransactions([]);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // ✅ Payload mapping to match backend Pydantic schema
      const transactionData = {
        account_id: parseInt(formData.account_id),
        amount: parseFloat(formData.amount),
        txn_type: formData.txn_type,
        description: formData.description,
        category: formData.category || "General",
        merchant: formData.merchant || "",
        date: new Date(formData.date).toISOString()
      };

      if (editingTransaction) {
        // ✅ Added trailing slash
        await axiosClient.put(`/api/transactions/${editingTransaction.id}`, transactionData);
        // Transaction updated alert
        try {
          const title = 'Transaction Updated';
          const msg = `₹${transactionData.amount.toLocaleString('en-IN')} - ${transactionData.description || ''}`;
          await createAlert(title, msg, 'info');
          NotificationService.showNotification(title, { body: msg });
          window.dispatchEvent(new CustomEvent('alertsUpdated'));
        } catch (e) {
          console.warn('Failed to create alert for update:', e);
        }
      } else {
        // ✅ Added trailing slash to fix 405 Method Not Allowed
        const response = await axiosClient.post('/api/transactions/', transactionData);
        
        // Handle Budget Alerts if returned by backend
        if (response.data.budget_alert) {
          const b = response.data.budget_alert;
          // Create a persistent alert and show push notification
          await createAlert(`Budget Warning`, b.message, 'high');
          NotificationService.showNotification('⚠️ Budget Warning', { body: b.message });
          // Tell Alerts page to refresh
          window.dispatchEvent(new CustomEvent('alertsUpdated'));
        } else {
          // Create a transaction alert and show notification
          const title = transactionData.txn_type === 'credit' ? 'Income Added' : 'Expense Added';
          const msg = `₹${transactionData.amount.toLocaleString('en-IN')} - ${transactionData.description || ''}`;
          await createAlert(title, msg, 'info');
          NotificationService.showTransactionAlert(transactionData.amount, transactionData.txn_type, transactionData.description);
          window.dispatchEvent(new CustomEvent('alertsUpdated'));
        }
      }
      
      await fetchData();
      resetForm();
    } catch (err) {
      console.error('Error saving transaction:', err);
      let msg = 'Failed to save transaction';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        msg = Array.isArray(detail)
          ? detail.map(d => `${d.loc && d.loc.length > 1 ? d.loc.slice(1).join('.') : d.loc || 'field'}: ${d.msg}`).join(', ')
          : String(detail);
      }
      setError(msg);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      // ✅ Added trailing slash
      await axiosClient.delete(`/api/transactions/${id}`);
      setTransactions(transactions.filter(t => t.id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
      try {
        let msg = 'Failed to delete transaction';
        if (error?.response?.data?.detail) {
          const detail = error.response.data.detail;
          msg = Array.isArray(detail)
            ? detail.map(d => `${d.loc && d.loc.length > 1 ? d.loc.slice(1).join('.') : d.loc || 'field'}: ${d.msg}`).join(', ')
            : String(detail);
        }
        await createAlert('Transaction Delete Failed', msg, 'high');
        NotificationService.showNotification('Transaction Delete Failed', { body: msg });
        window.dispatchEvent(new CustomEvent('alertsUpdated'));
      } catch (e) {
        console.warn('Failed to create alert for delete failure:', e);
      }
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      date: transaction.txn_date ? transaction.txn_date.split('T')[0] : new Date().toISOString().split('T')[0],
      description: transaction.description,
      amount: Math.abs(transaction.amount),
      txn_type: transaction.txn_type,
      category: transaction.category || '',
      merchant: transaction.merchant || '',
      account_id: transaction.account_id
    });
    setEditingTransaction(transaction);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      txn_type: 'debit',
      category: '',
      merchant: '',
      account_id: ''
    });
    setEditingTransaction(null);
    setShowModal(false);
    setError('');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    fetchData();
  };

  const clearFilters = () => {
    setFilters({
      account_id: '',
      category: '',
      transaction_type: '',
      date_from: '',
      date_to: ''
    });
    setTimeout(() => fetchData(), 100);
  };

  const getAccountName = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? account.name : 'Unknown Account';
  };

  const getAccountBalance = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? parseFloat(account.balance || 0) : 0;
  };

  const getTransactionColor = (type) => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const handleExportCSV = async () => {
    try {
      // Create CSV content from current transactions
      const csvContent = [
        'Date,Description,Amount,Type,Category,Merchant',
        ...transactions.map(t => 
          `${formatDate(t.txn_date)},"${t.description}",${t.amount},${t.txn_type},"${t.category}","${t.merchant || ''}"`
        )
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transactions.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      setError('Failed to export transactions');
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const templateContent = 'Date,Description,Amount,Type,Category,Merchant\n2024-01-01,"Sample Transaction",100.00,debit,"General","Sample Store"';
      
      const blob = new Blob([templateContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'transaction_template.csv';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Template download failed:', error);
      setError('Failed to download template');
    }
  };

  const handleImportCSV = async () => {
    if (!importFile || !formData.account_id) {
      setError('Please select a file and account');
      return;
    }

    setImportLoading(true);
    try {
      const text = await importFile.text();
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',');
      
      let imported = 0;
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length >= 4) {
          const newTransaction = {
            id: Date.now() + i,
            txn_date: values[0],
            description: values[1].replace(/"/g, ''),
            amount: parseFloat(values[2]) || 0,
            txn_type: values[3] || 'debit',
            category: values[4]?.replace(/"/g, '') || 'General',
            merchant: values[5]?.replace(/"/g, '') || '',
            account_id: parseInt(formData.account_id)
          };
          setTransactions(prev => [...prev, newTransaction]);
          imported++;
        }
      }
      
      setShowImportModal(false);
      setImportFile(null);
      setError(`Successfully imported ${imported} transactions`);
      
    } catch (error) {
      console.error('Import failed:', error);
      setError('Failed to import CSV');
    } finally {
      setImportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <Navbar title="Transactions" />
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Transaction History
          </h1>
          <div className="flex gap-3">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-xl shadow-lg transition-all hover:bg-green-600 active:scale-95"
            >
              <Download size={20} />
              Export CSV
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-xl shadow-lg transition-all hover:bg-orange-600 active:scale-95"
            >
              <Upload size={20} />
              Import CSV
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg transition-all active:scale-95 ${
                showFilters 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Filter size={20} />
              Filters
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center gap-2 active:scale-95"
            >
              <Plus size={20} />
              Add Transaction
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg shadow-sm">
            {error}
          </div>
        )}

        {/* Account Summary Cards */}
        {accounts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {accounts.map((account) => (
              <div key={account.id} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-700 truncate">{account.name}</h3>
                  <CreditCard className="w-4 h-4 text-gray-400" />
                </div>
                <div className="text-lg font-bold text-gray-900">
                  ₹{parseFloat(account.balance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {(account.account_type || account.type || '').replace(/_/g, ' ')}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Currency Converter */}
        <div className="mb-6">
          <CurrencyConverter />
        </div>
        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Filter Transactions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account</label>
                <select
                  name="account_id"
                  value={filters.account_id}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Accounts</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>{acc.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                <select
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Categories</option>
                  <option value="General">General</option>
                  <option value="Food & Dining">Food & Dining</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Bills & Utilities">Bills & Utilities</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Income">Income</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                <select
                  name="transaction_type"
                  value={filters.transaction_type}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">All Types</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">From Date</label>
                <input
                  type="date"
                  name="date_from"
                  value={filters.date_from}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">To Date</label>
                <input
                  type="date"
                  name="date_to"
                  value={filters.date_to}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={applyFilters}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={clearFilters}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">
                        {formatDate(transaction.txn_date)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                        <div className="text-xs text-gray-400 font-mono uppercase">{transaction.merchant}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-700">{getAccountName(transaction.account_id)}</div>
                        <div className="text-xs text-gray-400">Balance: ₹{getAccountBalance(transaction.account_id).toLocaleString('en-IN')}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg">
                          {transaction.category}
                        </span>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${getTransactionColor(transaction.txn_type)}`}>
                        {transaction.txn_type === 'credit' ? '+' : '-'} ₹{(Math.abs(transaction.amount) || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-3">
                          <button onClick={() => handleEdit(transaction)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDelete(transaction.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded-lg transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {editingTransaction ? '📝 Edit Transaction' : '💰 New Transaction'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Type</label>
                    <select
                      value={formData.txn_type}
                      onChange={(e) => setFormData({...formData, txn_type: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="debit">Debit</option>
                      <option value="credit">Credit</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="E.g. Monthly Rent"
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account</label>
                    <select
                      value={formData.account_id}
                      onChange={(e) => setFormData({...formData, account_id: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      required
                    >
                      <option value="">Select Account</option>
                      {accounts.map((acc) => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="General">📦 General</option>
                      <option value="Food & Dining">🍔 Food & Dining</option>
                      <option value="Transportation">🚗 Transportation</option>
                      <option value="Shopping">🛍️ Shopping</option>
                      <option value="Entertainment">🎬 Entertainment</option>
                      <option value="Bills & Utilities">💡 Bills & Utilities</option>
                      <option value="Healthcare">🏥 Healthcare</option>
                      <option value="Income">💰 Income</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Merchant</label>
                    <input
                      type="text"
                      value={formData.merchant}
                      onChange={(e) => setFormData({...formData, merchant: e.target.value})}
                      placeholder="E.g. Amazon, Walmart"
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-200"
                  >
                    {editingTransaction ? 'Save' : 'Confirm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CSV Import Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-xl font-bold text-gray-900 mb-6">📊 Import Transactions</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Account</label>
                  <select
                    value={formData.account_id}
                    onChange={(e) => setFormData({...formData, account_id: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  >
                    <option value="">Choose Account</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">CSV File</label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setImportFile(e.target.files[0])}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Expected columns: date, amount, type, description, category, merchant
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800 font-medium mb-2">Need a template?</p>
                  <button
                    onClick={handleDownloadTemplate}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <FileText size={16} />
                    Download CSV Template
                  </button>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                  }}
                  className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportCSV}
                  disabled={importLoading || !importFile || !formData.account_id}
                  className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-bold shadow-lg disabled:opacity-50"
                >
                  {importLoading ? 'Importing...' : 'Import'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;