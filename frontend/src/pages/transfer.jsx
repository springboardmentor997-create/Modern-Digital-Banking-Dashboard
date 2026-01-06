import React, { useState, useEffect } from 'react';
import { 
  CreditCard, ArrowUpRight, ArrowDownRight, Search, 
  Download, Eye, EyeOff, Plus, IndianRupee
} from 'lucide-react';
import { getAccounts } from '../api/accounts';
import { getTransactions, createTransaction } from '../api/transactions';
import toast from 'react-hot-toast';
import Load from '../components/Loader';

export default function Transfer() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(localStorage.getItem("selected_account_id"));
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [hideAmounts, setHideAmounts] = useState({});

  const [form, setForm] = useState({
    description: '',
    merchant: '',
    amount: '',
    category: 'Other',
    txn_type: 'debit',
    currency: 'INR'
  });

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Salary', 'Other'];
  
  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadTransactions();
    }
  }, [selectedAccount]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await getAccounts();
      setAccounts(data);
      if (data.length > 0) {
        setSelectedAccount(data[0].id);
      }
    } catch (e) {
      toast.error(e.message || 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getTransactions(selectedAccount);
      setTransactions(data);
    } catch (e) {
      toast.error(e.message || 'No transactions found');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async () => {
    if (!form.description || !form.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      await createTransaction(selectedAccount, {
        description: form.description,
        merchant: form.merchant || form.description,
        amount: Number(form.amount),
        category: form.category,
        txn_type: form.txn_type,
        currency: form.currency,
        txn_date: new Date().toISOString()
      });
      toast.success('Transaction added successfully');
      setShowAddModal(false);
      setForm({
        description: '',
        merchant: '',
        amount: '',
        category: 'Other',
        txn_type: 'debit',
        currency: 'INR'
      });
      loadTransactions();
    } catch (e) {
      toast.error(e.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      toast.error('No transactions to export');
      return;
    }

    const headers = ['Date', 'Description', 'Merchant', 'Category', 'Amount', 'Type', 'Currency'];
    const rows = filteredTransactions.map(t => [
      new Date(t.txn_date).toLocaleDateString(),
      t.description,
      t.merchant || '-',
      t.category,
      t.amount,
      t.txn_type,
      t.currency
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('CSV exported successfully');
  };

  const toggleHideAmount = (accountId) => {
    setHideAmounts(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }));
  };

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.merchant?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || t.txn_type === filterType;
    const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
    const matchesDateFrom = !dateFrom || new Date(t.txn_date) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(t.txn_date) <= new Date(dateTo);

    return matchesSearch && matchesType && matchesCategory && matchesDateFrom && matchesDateTo;
  });

  const totalDebit = filteredTransactions
    .filter(t => t.txn_type === 'debit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalCredit = filteredTransactions
    .filter(t => t.txn_type === 'credit')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const currentAccount = accounts.find(a => a.id === selectedAccount);

  if (loading) {
    return <Load/>
  }

  return (
    <main className="min-h-screen overflow-y-auto">
      <div className="lg: mx-auto w-full">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Transactions</h1>

        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-6 border border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3 mb-4">
              <CreditCard size={20} className="sm:w-6 sm:h-6 text-blue-600" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Select Your Account</h2>
            </div>

            <select
              value={selectedAccount || ""}
              onChange={(e) => setSelectedAccount(Number(e.target.value))}
              className="w-full border border-gray-300 rounded-lg p-2.5 sm:p-3 mb-4 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.bank_name} - {acc.masked_account} ({acc.currency})
                </option>
              ))}
            </select>

            {currentAccount && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-4 sm:p-6">
                  <div className="text-xs sm:text-sm opacity-90 mb-2">Available Balance</div>
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4">
                    {hideAmounts[selectedAccount]
                      ? "••••••"
                      : `₹${Number(currentAccount.balance).toFixed(2)}`}
                  </div>
                  <button
                    onClick={() => toggleHideAmount(selectedAccount)}
                    className="flex items-center gap-1 text-xs sm:text-sm opacity-75 hover:opacity-100"
                  >
                    {hideAmounts[selectedAccount] ? <Eye size={14} className="sm:w-4 sm:h-4" /> : <EyeOff size={14} className="sm:w-4 sm:h-4" />}
                    {hideAmounts[selectedAccount] ? "Show" : "Hide"} Balance
                  </button>
                </div>

                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 sm:p-6">
                  <div className="text-xs sm:text-sm text-gray-600 mb-2">Account Type</div>
                  <div className="text-xl sm:text-2xl font-bold capitalize">{currentAccount.account_type}</div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-2">
                    <span className="font-semibold">{currentAccount.currency}</span> Currency
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:justify-end">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm sm:text-base"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" /> Add Transaction
            </button>

            <button
              onClick={handleExportCSV}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm sm:text-base"
            >
              <Download size={18} className="sm:w-5 sm:h-5" /> Export CSV
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="text-xs sm:text-sm opacity-90 mb-2">Money In</div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">₹{totalCredit.toFixed(0)}</div>
              <div className="text-xs sm:text-sm opacity-75 mt-2">
                <ArrowDownRight size={14} className="sm:w-4 sm:h-4 inline mr-1" />
                Credits
              </div>
            </div>

            <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-2xl p-4 sm:p-6 shadow-lg">
              <div className="text-xs sm:text-sm opacity-90 mb-2">Money Out</div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">₹{totalDebit.toFixed(0)}</div>
              <div className="text-xs sm:text-sm opacity-75 mt-2">
                <ArrowUpRight size={14} className="sm:w-4 sm:h-4 inline mr-1" />
                Debits
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl p-4 sm:p-6 shadow-lg sm:col-span-2 lg:col-span-1">
              <div className="text-xs sm:text-sm opacity-90 mb-2">Net Flow</div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold">
                ₹{(totalCredit - totalDebit).toFixed(0)}
              </div>
              <div className="text-xs sm:text-sm opacity-75 mt-2">
                {filteredTransactions.length} Transactions
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-200">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Filters & Search</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              <div className="relative sm:col-span-2 lg:col-span-1">
                <Search size={14} className="sm:w-4 sm:h-4 absolute left-3 top-2.5 sm:top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Merchant or description"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2 pl-9 sm:pl-10 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="all">All Types</option>
                <option value="debit">Money Out</option>
                <option value="credit">Money In</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />

              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b">
              <h3 className="text-lg sm:text-xl font-bold">Recent Transactions</h3>
            </div>

            {loading ? (
              <div className="p-12 sm:p-20 text-center">
                <div className="animate-spin h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500 text-sm sm:text-base">Loading transactions...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="p-12 sm:p-20 text-center">
                <CreditCard size={40} className="sm:w-12 sm:h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-semibold text-sm sm:text-base">No transactions found</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="text-left py-4 px-6">Date</th>
                        <th className="text-left py-4 px-6">Description</th>
                        <th className="text-left py-4 px-6">Merchant</th>
                        <th className="text-left py-4 px-6">Category</th>
                        <th className="text-right py-4 px-6">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map(txn => (
                        <tr key={txn.id} className="border-b hover:bg-blue-50">
                          <td className="py-4 px-6 font-semibold">
                            {new Date(txn.txn_date).toLocaleDateString()}
                          </td>
                          <td className="py-4 px-6">{txn.description}</td>
                          <td className="py-4 px-6">
                            {txn.merchant || "-"}
                          </td>
                          <td className="py-4 px-6">
                            <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                              {txn.category}
                            </span>
                          </td>
                          <td className={`py-4 px-6 text-right font-bold ${
                            txn.txn_type === "credit" ? "text-green-600" : "text-red-600"
                          }`}>
                            {txn.txn_type === "credit" ? "+" : "-"}₹{Number(txn.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden divide-y">
                  {filteredTransactions.map(txn => (
                    <div key={txn.id} className="p-4 hover:bg-blue-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm">{txn.description}</p>
                          <p className="text-xs text-gray-600 mt-1">{txn.merchant || "-"}</p>
                        </div>
                        <div className={`text-right font-bold text-sm ${
                          txn.txn_type === "credit" ? "text-green-600" : "text-red-600"
                        }`}>
                          {txn.txn_type === "credit" ? "+" : "-"}₹{Number(txn.amount).toFixed(2)}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                          {txn.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(txn.txn_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-2xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Add New Transaction</h2>

            <div className="space-y-3 sm:space-y-4">
              <input
                type="text"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base"
              />

              <input
                type="text"
                placeholder="Merchant"
                value={form.merchant}
                onChange={(e) => setForm({ ...form, merchant: e.target.value })}
                className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base"
              />

              <input
                type="number"
                placeholder="2000.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base"
              />

              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={form.txn_type}
                onChange={(e) => setForm({ ...form, txn_type: e.target.value })}
                className="w-full border border-gray-300 p-2.5 sm:p-3 rounded-lg text-sm sm:text-base"
              >
                <option value="debit">Money Out</option>
                <option value="credit">Money In</option>
              </select>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={handleAddTransaction}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base"
                >
                  Add Transaction
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-gray-300 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}