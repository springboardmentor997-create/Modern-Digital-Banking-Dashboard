import { useState, useEffect } from 'react';
import { Activity, Search, Filter, TrendingUp, DollarSign, ArrowUpDown, Calendar, Download, Upload, User, Eye, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/admin';

const TransactionManagement = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userTransactions, setUserTransactions] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const data = await adminApi.getAllTransactions();
        setTransactions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading transactions:', error);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, []);

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = !searchTerm || 
      txn.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || txn.txn_type === filterType;
    
    const matchesDate = !filterDate || 
      new Date(txn.txn_date).toDateString() === new Date(filterDate).toDateString();
    
    return matchesSearch && matchesType && matchesDate;
  });

  const totalAmount = transactions.reduce((sum, txn) => sum + parseFloat(txn.amount || 0), 0);
  const creditAmount = transactions.filter(txn => txn.txn_type === 'credit').reduce((sum, txn) => sum + parseFloat(txn.amount || 0), 0);
  const debitAmount = transactions.filter(txn => txn.txn_type === 'debit').reduce((sum, txn) => sum + parseFloat(txn.amount || 0), 0);

  const handleUserClick = (userId, userName) => {
    const userTxns = transactions.filter(txn => txn.user_id === userId);
    setSelectedUser({ id: userId, name: userName });
    setUserTransactions(userTxns);
    setShowUserModal(true);
  };

  const exportToCSV = async (isUserExport = false) => {
    try {
      let response;
      if (isUserExport && selectedUser) {
        response = await adminApi.exportUserTransactionsCSV(selectedUser.id);
      } else {
        response = await adminApi.exportTransactionsCSV();
      }
      
      const blob = new Blob([response.csv_data], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', response.filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export CSV. Please try again.');
    }
  };

  const handleExportAll = () => {
    exportToCSV(false);
  };

  const handleExportUser = () => {
    exportToCSV(true);
  };

  const processImport = async () => {
    if (!importFile) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvContent = e.target.result;
        
        try {
          const result = await adminApi.importTransactionsCSV(csvContent);
          alert(`${result.message}\n\nImported: ${result.imported_count} transactions\nErrors: ${result.total_errors}`);
          
          // Reload transactions after import
          const data = await adminApi.getAllTransactions();
          setTransactions(Array.isArray(data) ? data : []);
          
          setShowImportModal(false);
          setImportFile(null);
        } catch (error) {
          console.error('Import failed:', error);
          alert('Failed to import CSV. Please check the file format and try again.');
        }
      };
      reader.readAsText(importFile);
    } catch (error) {
      console.error('File reading failed:', error);
      alert('Failed to read the file. Please try again.');
    }
  };

  const handleImportCSV = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      setImportFile(file);
      setShowImportModal(true);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 p-3 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">Transaction Management</h1>
        <p className="text-sm sm:text-base text-gray-600">View and monitor all system transactions (Read-Only)</p>
      </div>

      {/* Transaction Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6 border border-blue-100">
          <div className="flex items-center">
            <div className="bg-blue-500 p-2 sm:p-3 rounded-lg sm:rounded-xl">
              <Activity className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Total</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{transactions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6 border border-blue-100">
          <div className="flex items-center">
            <div className="bg-green-500 p-2 sm:p-3 rounded-lg sm:rounded-xl">
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Credits</p>
              <p className="text-sm sm:text-2xl font-bold text-green-600">₹{creditAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6 border border-blue-100">
          <div className="flex items-center">
            <div className="bg-red-500 p-2 sm:p-3 rounded-lg sm:rounded-xl">
              <ArrowUpDown className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Debits</p>
              <p className="text-sm sm:text-2xl font-bold text-red-600">₹{debitAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-6 border border-blue-100 col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <div className="bg-purple-500 p-2 sm:p-3 rounded-lg sm:rounded-xl">
              <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="ml-2 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-500">Net Flow</p>
              <p className={`text-sm sm:text-2xl font-bold ${creditAmount - debitAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{(creditAmount - debitAmount).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSV Import/Export Controls */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border border-blue-100">
        <div className="space-y-4">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Data Management</h3>
            <p className="text-xs sm:text-sm text-gray-600">Import and export transaction data</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg cursor-pointer transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium">
              <Upload className="w-4 h-4" />
              Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </label>
            <button
              onClick={handleExportAll}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Export All CSV
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border border-blue-100">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Transactions</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by user or description..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type</label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Types</option>
                  <option value="credit">Credit</option>
                  <option value="debit">Debit</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block sm:hidden">
        <div className="space-y-3">
          {filteredTransactions.map((txn) => (
            <div key={txn.id} className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer"
                       onClick={() => handleUserClick(txn.user_id, txn.user_name)}>
                    {txn.user_name ? txn.user_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-semibold text-gray-900 cursor-pointer"
                         onClick={() => handleUserClick(txn.user_id, txn.user_name)}>
                      {txn.user_name || 'N/A'}
                    </div>
                    <div className="text-xs text-gray-500">ID: {txn.user_id}</div>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  txn.txn_type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {txn.txn_type === 'credit' ? 'CR' : 'DR'}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <div className={`text-lg font-bold ${
                  txn.txn_type === 'credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {txn.txn_type === 'credit' ? '+' : '-'}₹{(Number(txn.amount) || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  {txn.txn_date ? new Date(txn.txn_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                </div>
              </div>
              <div className="text-sm text-gray-600 truncate">
                {txn.description || 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {txn.category || 'General'}
              </div>
            </div>
          ))}
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-blue-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-50 to-purple-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-blue-50/50 transition-colors duration-200">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:scale-105 transition-transform duration-200"
                           onClick={() => handleUserClick(txn.user_id, txn.user_name)}>
                        {txn.user_name ? txn.user_name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                             onClick={() => handleUserClick(txn.user_id, txn.user_name)}>
                          {txn.user_name || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">ID: {txn.user_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                      txn.txn_type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {txn.txn_type?.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-bold ${
                      txn.txn_type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {txn.txn_type === 'credit' ? '+' : '-'}₹{(Number(txn.amount) || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {txn.category || 'General'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {txn.description || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {txn.txn_date ? new Date(txn.txn_date).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Completed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* User Transactions Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold truncate">Transactions for {selectedUser?.name}</h2>
                  <p className="text-blue-100 text-sm">User ID: {selectedUser?.id} • {userTransactions.length} transactions</p>
                </div>
                <div className="flex gap-2 sm:gap-3 flex-shrink-0">
                  <button
                    onClick={handleExportUser}
                    className="bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export CSV</span>
                    <span className="sm:hidden">Export</span>
                  </button>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors duration-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="p-3 sm:p-6 max-h-[60vh] overflow-y-auto">
              {userTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {userTransactions.map((txn) => (
                        <tr key={txn.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              txn.txn_type === 'credit' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {txn.txn_type?.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className={`text-sm font-bold ${
                              txn.txn_type === 'credit' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {txn.txn_type === 'credit' ? '+' : '-'}₹{(Number(txn.amount) || 0).toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {txn.category || 'General'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {txn.description || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {txn.txn_date ? new Date(txn.txn_date).toLocaleDateString() : 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {txn.account_type || 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No transactions found</h3>
                  <p className="mt-1 text-sm text-gray-500">This user has no transaction history.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Import CSV File</h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Selected file:</p>
                <p className="font-medium text-gray-900">{importFile?.name}</p>
                <p className="text-xs text-gray-500">Size: {(importFile?.size / 1024).toFixed(2)} KB</p>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Import Notice</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      This will process the CSV file and import transaction data. Make sure the file format is correct.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={processImport}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement;