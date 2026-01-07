import React, { useState, useEffect } from 'react';
import { Upload, Download, Filter, Search, ArrowUpRight, ArrowDownRight, X, FileText, IndianRupee } from 'lucide-react';
import { getAccounts } from '../api/accounts';
import { getTransactions, importCSV } from '../api/transactions';
import toast from 'react-hot-toast';
import Load from '../components/Loader';

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
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }

  async function fetchTransactions() {
    if (!selectedAccountId) return;
    
    try {
      setLoading(true);
      const data = await getTransactions(selectedAccountId);
      setTransactions(data);
    } catch (error) {
      toast.error('No transactions found');
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

  if (loading) {
    return <Load/>
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Transactions</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Track all your financial activities</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowUploadModal(true)}
              disabled={loading}
              className="px-4 sm:px-5 py-2 bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              Import CSV
            </button>
            <button
              onClick={exportToCSV}
              disabled={loading || filteredTransactions.length === 0}
              className="px-4 sm:px-5 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
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
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
          >
            <option value="">Choose an account...</option>
            {accounts.map(account => (
              <option key={account.id} value={account.id}>
                {account.bank_name} - {account.account_type} (****{account.masked_account})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Income</p>
                <p className="text-xl sm:text-2xl font-bold text-green-600 flex items-center">
                  <IndianRupee size={20} className='sm:w-[26px] sm:h-[26px]' /> 
                  <span className="ml-1">{totalIncome.toFixed(2)}</span>
                </p>
              </div>
              <ArrowUpRight className="w-8 h-8 sm:w-10 sm:h-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Expenses</p>
                <p className="text-xl sm:text-2xl font-bold text-red-600 flex items-center">
                  <IndianRupee size={20} className='sm:w-[26px] sm:h-[26px]' /> 
                  <span className="ml-1">{totalExpense.toFixed(2)}</span>
                </p>
              </div>
              <ArrowDownRight className="w-8 h-8 sm:w-10 sm:h-10 text-red-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-l-4 border-blue-500 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-1">Net Balance</p>
                <p className={`text-xl sm:text-2xl flex items-center font-bold ${totalIncome - totalExpense >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                  <IndianRupee size={20} className='sm:w-[26px] sm:h-[26px]'/> 
                  <span className="ml-1">{(totalIncome - totalExpense).toFixed(2)}</span>
                </p>
              </div>
              <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Filters</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="relative sm:col-span-2 lg:col-span-1">
              <Search className="absolute left-3 top-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                disabled={loading}
                className="w-full pl-9 sm:pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 disabled:opacity-50 text-sm sm:text-base"
              />
            </div>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              disabled={loading}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 disabled:opacity-50 text-sm sm:text-base"
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
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 disabled:opacity-50 text-sm sm:text-base"
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
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 disabled:opacity-50 text-sm sm:text-base"
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              disabled={loading}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 disabled:opacity-50 text-sm sm:text-base"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {loading && transactions.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base">Loading transactions...</p>
            </div>
          ) : (
            <>
              <div className="hidden md:block overflow-x-auto">
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
                          <td className={`px-6 py-1 text-sm font-bold`}>
                            <div className="flex items-center justify-end gap-1">
                              {tx.txn_type === 'credit' ? '+' : '-'}
                              {tx.currency !== "INR" ? '$' : <IndianRupee size={16} />}
                              {parseFloat(tx.amount).toFixed(2)} {tx.currency}
                            </div>
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

              <div className="md:hidden divide-y">
                {!selectedAccountId ? (
                  <div className="px-4 py-12 text-center text-gray-500 text-sm">
                    Please select an account to view transactions
                  </div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="px-4 py-12 text-center text-gray-500 text-sm">
                    No transactions found. Import CSV to get started.
                  </div>
                ) : (
                  filteredTransactions.map((tx) => (
                    <div key={tx.id} className="p-4 hover:bg-gray-50 transition-colors mb-2" >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{tx.description}</p>
                          <p className="text-xs text-gray-600 mt-1">{tx.merchant}</p>
                        </div>
                        <div className={`text-right font-bold text-sm ${tx.txn_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                          <div className="flex items-center justify-end gap-1">
                            {tx.txn_type === 'credit' ? '+' : '-'}
                            {tx.currency !== "INR" ? '$' : <IndianRupee size={14} />}
                            {parseFloat(tx.amount).toFixed(2)}
                          </div>
                          <div className="text-xs mt-1">{tx.currency}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {tx.category}
                        </span>
                        {tx.txn_type === 'credit' ? (
                          <span className="flex items-center gap-1 text-green-600 text-xs font-medium">
                            <ArrowUpRight className="w-3 h-3" /> Income
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 text-xs font-medium">
                            <ArrowDownRight className="w-3 h-3" /> Expense
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {new Date(tx.txn_date).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedTransaction(tx)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-xs transition-colors"
                      >
                        View Details →
                      </button>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>

        {showUploadModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Import Transactions</h2>
                <button 
                  onClick={() => setShowUploadModal(false)} 
                  disabled={loading}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all disabled:opacity-50"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {!selectedAccountId && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                    <p className="text-xs sm:text-sm text-yellow-800">Please select an account first!</p>
                  </div>
                )}

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center">
                  <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">Upload CSV file with transaction data</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="block w-full text-xs sm:text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 file:cursor-pointer disabled:opacity-50"
                  />
                  {csvFile && (
                    <p className="mt-2 text-xs sm:text-sm text-green-600">Selected: {csvFile.name}</p>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-blue-800 font-medium mb-2">CSV Format:</p>
                  <p className="text-xs text-blue-700">description, category, amount, currency, txn_type, merchant, txn_date</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    disabled={loading}
                    className="flex-1 py-2.5 sm:py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-all disabled:opacity-50 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCsvUpload}
                    disabled={!selectedAccountId || !csvFile || loading}
                    className="flex-1 py-2.5 sm:py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
            <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Transaction Details</h2>
                <button 
                  onClick={() => setSelectedTransaction(null)} 
                  className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Description:</span>
                  <span className="font-medium text-right">{selectedTransaction.description}</span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Merchant:</span>
                  <span className="font-medium text-right">{selectedTransaction.merchant}</span>
                </div>
                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-gray-600">Category:</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-medium">
                    {selectedTransaction.category}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Type:</span>
                  <span className={`font-medium ${selectedTransaction.txn_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTransaction.txn_type === 'credit' ? 'Income' : 'Expense'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="text-gray-600">Amount:</span>
                  <span className={`text-lg sm:text-xl font-bold flex items-center ${selectedTransaction.txn_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {selectedTransaction.txn_type === 'credit' ? '+' : '-'}
                    {selectedTransaction.currency !== "INR" ? '$' : <IndianRupee size={16} className="mx-1" />}
                    {parseFloat(selectedTransaction.amount).toFixed(2)} {selectedTransaction.currency}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">Transaction Date:</span>
                  <span className="font-medium text-right">{new Date(selectedTransaction.txn_date).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}