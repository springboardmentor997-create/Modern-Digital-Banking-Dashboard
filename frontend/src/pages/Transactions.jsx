import React, { useState, useEffect } from 'react';
import { Upload, Download, Filter, Search, ArrowUpRight, ArrowDownRight, X, FileText } from 'lucide-react';
import { getAccounts } from '../api/accounts';
import { getTransactions, importCSV } from '../api/transactions';
import toast from 'react-hot-toast';

export default function Transactions() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [csvFile, setCsvFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    type: 'all',
    dateFrom: '',
    dateTo: ''
  });

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Salary', 'Investment', 'Other'];

  useEffect(() => {
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccountId) {
      fetchTransactions();
    }
  }, [selectedAccountId]);

  useEffect(() => {
    applyFilters();
  }, [filters, transactions]);

  async function fetchAccounts() {
    try {
      setLoading(true);
      const data = await getAccounts();
      setAccounts(data);
      if (data.length > 0 && !selectedAccountId) {
        setSelectedAccountId(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }

  async function fetchTransactions() {
    if (!selectedAccountId) return;
    
    try {
      setLoading(true);
      const data = await getTransactions(selectedAccountId, 0, 100);
      setTransactions(data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...transactions];

    if (filters.search) {
      filtered = filtered.filter(tx => 
        tx.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        tx.merchant.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.category !== 'all') {
      filtered = filtered.filter(tx => tx.category === filters.category);
    }

    if (filters.type !== 'all') {
      filtered = filtered.filter(tx => tx.txn_type === filters.type);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(tx => new Date(tx.txn_date) >= new Date(filters.dateFrom));
    }

    if (filters.dateTo) {
      filtered = filtered.filter(tx => new Date(tx.txn_date) <= new Date(filters.dateTo));
    }

    setFilteredTransactions(filtered);
  }

  function handleFilterChange(key, value) {
    setFilters({ ...filters, [key]: value });
  }

  function handleFileChange(e) {
    setCsvFile(e.target.files[0]);
  }

  async function handleCsvUpload() {
    if (!csvFile) {
      toast.error('Please select a CSV file');
      return;
    }

    if (!selectedAccountId) {
      toast.error('Please select an account first');
      return;
    }

    try {
      setLoading(true);
      const result = await importCSV(selectedAccountId, csvFile);
      toast.success(`Success! Imported ${result.count} transactions`);
      setShowUploadModal(false);
      setCsvFile(null);
      await fetchTransactions();
    } catch (error) {
      console.error('Error importing CSV:', error);
      const errorMessage = typeof error === 'string' ? error : error?.detail || 'Failed to import CSV';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function exportToCSV() {
    const headers = ['Date', 'Description', 'Category', 'Merchant', 'Type', 'Amount', 'Currency'];
    const rows = filteredTransactions.map(tx => [
      new Date(tx.txn_date).toLocaleDateString(),
      tx.description,
      tx.category,
      tx.merchant,
      tx.txn_type,
      tx.amount,
      tx.currency
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Transactions exported successfully!');
  }

  const totalIncome = filteredTransactions
    .filter(tx => tx.txn_type === 'credit')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  const totalExpense = filteredTransactions
    .filter(tx => tx.txn_type === 'debit')
    .reduce((sum, tx) => sum + parseFloat(tx.amount), 0);

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-1">Track all your financial activities</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              disabled={loading}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Upload className="w-5 h-5" />
              Import CSV
            </button>
            <button
              onClick={exportToCSV}
              disabled={loading || filteredTransactions.length === 0}
              className="px-5 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Account</label>
          <select
            value={selectedAccountId || ''}
            onChange={(e) => setSelectedAccountId(parseInt(e.target.value))}
            disabled={loading}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">Choose an account...</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.bank_name} - {account.account_type} (****{account.masked_account})
              </option>
            ))}
          </select>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Income</p>
                <p className="text-2xl font-bold text-green-600">
                  ${totalIncome.toFixed(2)}
                </p>
              </div>
              <ArrowUpRight className="w-10 h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">
                  ${totalExpense.toFixed(2)}
                </p>
              </div>
              <ArrowDownRight className="w-10 h-10 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Net Balance</p>
                <p className={`text-2xl font-bold ${totalIncome - totalExpense >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  ${(totalIncome - totalExpense).toFixed(2)}
                </p>
              </div>
              <FileText className="w-10 h-10 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">Filters</h3>
          </div>

          <div className="grid md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 disabled:opacity-50"
              />
            </div>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              disabled={loading}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 disabled:opacity-50"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              disabled={loading}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 disabled:opacity-50"
            >
              <option value="all">All Types</option>
              <option value="credit">Income</option>
              <option value="debit">Expense</option>
            </select>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              disabled={loading}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 disabled:opacity-50"
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              disabled={loading}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 disabled:opacity-50"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading && transactions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading transactions...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Description</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Merchant</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-700">Type</th>
                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">Amount</th>
                    <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {!selectedAccountId ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        Please select an account to view transactions
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        No transactions found. Import CSV to get started.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(tx.txn_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {tx.description}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{tx.merchant}</td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {tx.txn_type === 'credit' ? (
                            <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                              <ArrowUpRight className="w-4 h-4" /> Income
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                              <ArrowDownRight className="w-4 h-4" /> Expense
                            </span>
                          )}
                        </td>
                        <td className={`px-6 py-4 text-right text-sm font-bold ${tx.txn_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.txn_type === 'credit' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)} {tx.currency}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedTransaction(tx)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Import Transactions</h2>
                <button 
                  onClick={() => setShowUploadModal(false)} 
                  disabled={loading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {!selectedAccountId && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-sm text-yellow-800">Please select an account first!</p>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-sm text-gray-600 mb-4">Upload CSV file with transaction data</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer disabled:opacity-50"
                  />
                  {csvFile && (
                    <p className="mt-2 text-sm text-green-600">Selected: {csvFile.name}</p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800 font-medium mb-2">CSV Format:</p>
                  <p className="text-xs text-blue-700">description, category, amount, currency, txn_type, merchant, txn_date</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    disabled={loading}
                    className="flex-1 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCsvUpload}
                    disabled={!selectedAccountId || !csvFile || loading}
                    className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Importing...
                      </>
                    ) : (
                      'Import'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {selectedTransaction && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Transaction Details</h2>
                <button 
                  onClick={() => setSelectedTransaction(null)} 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium">{selectedTransaction.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Merchant:</span>
                  <span className="font-medium">{selectedTransaction.merchant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Category:</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {selectedTransaction.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className={`font-medium ${selectedTransaction.txn_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTransaction.txn_type === 'credit' ? 'Income' : 'Expense'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className={`text-xl font-bold ${selectedTransaction.txn_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTransaction.txn_type === 'credit' ? '+' : '-'}${parseFloat(selectedTransaction.amount).toFixed(2)} {selectedTransaction.currency}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Date:</span>
                  <span className="font-medium">{new Date(selectedTransaction.txn_date).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted Date:</span>
                  <span className="font-medium">{new Date(selectedTransaction.posted_date).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}