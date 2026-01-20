import React, { useState, useEffect } from 'react';
import { 
  Camera, Scan, Receipt, Tag, TrendingUp, PieChart, 
  Calendar, Filter, Search, Plus, Edit, Trash2, 
  MapPin, Clock, DollarSign, ShoppingCart, Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : (API_BASE_URL ? `${API_BASE_URL}/api` : '/api');

const SmartExpenseTracker = () => {
  const { user, token } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [receipts, setReceipts] = useState([]);
  const [activeView, setActiveView] = useState('recent');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showReceipts, setShowReceipts] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [newExpense, setNewExpense] = useState({
    amount: '',
    description: '',
    category: '',
    location: '',
    merchant: '',
    has_receipt: false
  });

  useEffect(() => {
    loadMockData();
  }, []);

  const apiCall = async (endpoint, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }
    
    // Handle empty responses (like DELETE)
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      return null;
    }
    
    return response.json();
  };

  const loadExpenseData = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/expenses/');
      setExpenses(Array.isArray(data) ? data : []);
      
      // Calculate category totals
      const categoryTotals = (Array.isArray(data) ? data : []).reduce((acc, expense) => {
        if (expense && expense.category) {
          acc[expense.category] = (acc[expense.category] || 0) + (expense.amount || 0);
        }
        return acc;
      }, {});
      
      setCategories(categoryTotals);
    } catch (error) {
      console.error('Failed to load expenses:', error);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await apiCall('/expenses/categories/list');
      setAvailableCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Fallback categories
      setAvailableCategories([
        { name: "Food & Dining", icon: "🍔", color: "bg-red-500" },
        { name: "Transportation", icon: "🚗", color: "bg-blue-500" },
        { name: "Groceries", icon: "🛒", color: "bg-green-500" },
        { name: "Entertainment", icon: "🎬", color: "bg-purple-500" },
        { name: "Shopping", icon: "🛍️", color: "bg-yellow-500" },
        { name: "Healthcare", icon: "🏥", color: "bg-pink-500" },
        { name: "Utilities", icon: "💡", color: "bg-indigo-500" }
      ]);
    }
  };

  const loadAnalytics = async () => {
    try {
      const data = await apiCall('/expenses/analytics/summary?days=30');
      setAnalytics(data || {});
    } catch (error) {
      console.error('Failed to load analytics:', error);
      setAnalytics({
        total_expenses: 0,
        average_daily: 0,
        expense_count: 0,
        highest_expense: 0,
        category_breakdown: {},
        top_merchants: []
      });
    }
  };

  const loadMockData = () => {
    const mockExpenses = [
      {
        id: 1,
        amount: 45.67,
        description: 'Starbucks Coffee',
        category: 'Food & Dining',
        location: 'Downtown Mall',
        merchant: 'Starbucks',
        expense_date: new Date().toISOString(),
        has_receipt: true,
        ai_suggested: true
      },
      {
        id: 2,
        amount: 89.99,
        description: 'Gas Station Fill-up',
        category: 'Transportation',
        location: 'Shell Station',
        merchant: 'Shell',
        expense_date: new Date(Date.now() - 86400000).toISOString(),
        has_receipt: false,
        ai_suggested: false
      }
    ];
    
    setExpenses(mockExpenses);
    
    const categoryTotals = mockExpenses.reduce((acc, expense) => {
      if (expense && expense.category) {
        acc[expense.category] = (acc[expense.category] || 0) + (expense.amount || 0);
      }
      return acc;
    }, {});
    
    setCategories(categoryTotals);
    
    setAnalytics({
      total_expenses: 135.66,
      average_daily: 45.22,
      expense_count: 2,
      highest_expense: 89.99,
      category_breakdown: categoryTotals,
      top_merchants: [
        { merchant: 'Starbucks', count: 1, total: 45.67 },
        { merchant: 'Shell', count: 1, total: 89.99 }
      ]
    });
    
    setReceipts(mockExpenses.filter(e => e.has_receipt));
    
    setAvailableCategories([
      { name: "Food & Dining", icon: "🍔", color: "bg-red-500" },
      { name: "Transportation", icon: "🚗", color: "bg-blue-500" },
      { name: "Groceries", icon: "🛒", color: "bg-green-500" },
      { name: "Entertainment", icon: "🎬", color: "bg-purple-500" },
      { name: "Shopping", icon: "🛍️", color: "bg-yellow-500" },
      { name: "Healthcare", icon: "🏥", color: "bg-pink-500" },
      { name: "Utilities", icon: "💡", color: "bg-indigo-500" }
    ]);
  };

  const handleReceiptScan = async (file) => {
    try {
      setLoading(true);
      
      // Fallback to mock scan since API might not be ready
      const scannedData = {
        amount: '23.45',
        description: 'McDonald\'s Restaurant',
        category: 'Food & Dining',
        location: 'Main Street',
        merchant: 'McDonald\'s'
      };
      
      setNewExpense({ ...scannedData, has_receipt: true });
      setShowAddExpense(true);
    } catch (error) {
      console.error('Receipt scan failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        handleReceiptScan(file);
      }
    };
    input.click();
  };

  const addExpense = async () => {
    if (!newExpense.amount || !newExpense.description || !newExpense.category) {
      alert('Please fill in all required fields');
      return;
    }
    
    const newId = Math.max(...expenses.map(e => e.id), 0) + 1;
    const expenseData = {
      id: newId,
      amount: parseFloat(newExpense.amount),
      description: newExpense.description,
      category: newExpense.category,
      location: newExpense.location,
      merchant: newExpense.merchant,
      has_receipt: newExpense.has_receipt,
      ai_suggested: false,
      expense_date: new Date().toISOString()
    };
    
    setExpenses([expenseData, ...expenses]);
    setNewExpense({ amount: '', description: '', category: '', location: '', merchant: '', has_receipt: false });
    setShowAddExpense(false);
  };

  const loadReceipts = async () => {
    try {
      const data = await apiCall('/expenses/receipts/');
      setReceipts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load receipts:', error);
      const expensesWithReceipts = (expenses || []).filter(e => e && e.has_receipt);
      setReceipts(expensesWithReceipts);
    }
  };

  const editExpense = (expense) => {
    setNewExpense({
      amount: expense.amount.toString(),
      description: expense.description,
      category: expense.category,
      location: expense.location || '',
      merchant: expense.merchant || '',
      has_receipt: expense.has_receipt
    });
    setEditingExpense(expense);
    setShowAddExpense(true);
  };

  const updateExpense = async () => {
    if (!newExpense.amount || !newExpense.description || !newExpense.category) {
      alert('Please fill in all required fields');
      return;
    }
    
    try {
      setLoading(true);
      const expenseData = {
        amount: parseFloat(newExpense.amount),
        description: newExpense.description,
        category: newExpense.category,
        location: newExpense.location,
        merchant: newExpense.merchant,
        has_receipt: newExpense.has_receipt
      };
      
      const updatedExpense = await apiCall(`/expenses/${editingExpense.id}`, {
        method: 'PUT',
        body: JSON.stringify(expenseData)
      });
      
      setExpenses(expenses.map(e => e.id === editingExpense.id ? updatedExpense : e));
      setNewExpense({ amount: '', description: '', category: '', location: '', merchant: '', has_receipt: false });
      setEditingExpense(null);
      setShowAddExpense(false);
      
      loadExpenseData();
      loadAnalytics();
      loadReceipts();
    } catch (error) {
      console.error('Failed to update expense:', error);
      alert('Failed to update expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setNewExpense({ amount: '', description: '', category: '', location: '', merchant: '', has_receipt: false });
    setEditingExpense(null);
    setShowAddExpense(false);
  };

  const deleteExpense = async (expenseId) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }
    
    try {
      await apiCall(`/expenses/${expenseId}`, { method: 'DELETE' });
      setExpenses(expenses.filter(e => e.id !== expenseId));
      loadAnalytics();
      loadReceipts();
    } catch (error) {
      console.error('Failed to delete expense:', error);
      alert('Failed to delete expense. Please try again.');
    }
  };

  const getCategoryColor = (category) => {
    const categoryData = availableCategories.find(c => c.name === category);
    return categoryData?.color || 'bg-gray-500';
  };

  const getCategoryIcon = (category) => {
    const categoryData = availableCategories.find(c => c.name === category);
    return categoryData?.icon || '📦';
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-blue-50 to-green-100">
      <Navbar title="Smart Expense Tracker" />
      
      <div className="p-4 space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button 
            onClick={triggerFileUpload}
            disabled={loading}
            className="flex flex-col items-center p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-green-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mb-2" />
            ) : (
              <Camera className="w-8 h-8 text-green-600 mb-2" />
            )}
            <span className="text-sm font-medium text-gray-700">Scan Receipt</span>
          </button>
          
          <button 
            onClick={() => setShowAddExpense(true)}
            className="flex flex-col items-center p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-blue-200"
          >
            <Plus className="w-8 h-8 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Add Expense</span>
          </button>
          
          <button 
            onClick={() => {
              setActiveView('analytics');
              setShowAnalytics(true);
            }}
            className="flex flex-col items-center p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-purple-200"
          >
            <PieChart className="w-8 h-8 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Analytics</span>
          </button>
          
          <button 
            onClick={() => {
              setActiveView('receipts');
              setShowReceipts(true);
              loadReceipts();
            }}
            className="flex flex-col items-center p-4 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-orange-200"
          >
            <Receipt className="w-8 h-8 text-orange-600 mb-2" />
            <span className="text-sm font-medium text-gray-700">Receipts</span>
          </button>
        </div>

        {/* Category Overview */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month's Spending</h3>
          {Object.keys(categories).length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(categories).map(([category, amount]) => (
                <div key={category} className="text-center">
                  <div className={`w-12 h-12 ${getCategoryColor(category)} rounded-full mx-auto mb-2 flex items-center justify-center text-xl`}>
                    {getCategoryIcon(category)}
                  </div>
                  <p className="text-xs text-gray-600">{category}</p>
                  <p className="font-semibold text-gray-900">₹{(amount || 0).toFixed(2)}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No expenses yet. Start by adding your first expense!</p>
            </div>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="bg-white rounded-xl shadow-lg">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Expenses</h3>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <Filter className="w-5 h-5" />
                </button>
                <button className="p-2 text-gray-500 hover:text-gray-700">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="divide-y divide-gray-100">
            {(expenses || []).map(expense => (
              <div key={expense.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${getCategoryColor(expense.category)} rounded-full flex items-center justify-center text-lg`}>
                      {getCategoryIcon(expense.category)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{expense.description}</p>
                        {expense.ai_suggested && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">AI</span>
                        )}
                        {expense.has_receipt && (
                          <Receipt className="w-4 h-4 text-green-600" />
                        )}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Tag className="w-3 h-3 mr-1" />
                          {expense.category}
                        </span>
                        <span className="flex items-center">
                          <MapPin className="w-3 h-3 mr-1" />
                          {expense.location || 'N/A'}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {expense.expense_date ? new Date(expense.expense_date).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{(expense.amount || 0).toFixed(2)}</p>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => editExpense(expense)}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => deleteExpense(expense.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Expense Modal */}
        {showAddExpense && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingExpense ? 'Edit Expense' : 'Add New Expense'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="What did you buy?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select category</option>
                    {availableCategories.map(cat => (
                      <option key={cat.name} value={cat.name}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={newExpense.location}
                    onChange={(e) => setNewExpense({...newExpense, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Where did you shop?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Merchant</label>
                  <input
                    type="text"
                    value={newExpense.merchant}
                    onChange={(e) => setNewExpense({...newExpense, merchant: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Store or merchant name"
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="hasReceipt"
                    checked={newExpense.has_receipt}
                    onChange={(e) => setNewExpense({...newExpense, has_receipt: e.target.checked})}
                    className="mr-2"
                  />
                  <label htmlFor="hasReceipt" className="text-sm text-gray-700">I have a receipt for this expense</label>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={editingExpense ? cancelEdit : () => setShowAddExpense(false)}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingExpense ? updateExpense : addExpense}
                  disabled={loading || !newExpense.amount || !newExpense.description || !newExpense.category}
                  className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (editingExpense ? 'Updating...' : 'Adding...') : (editingExpense ? 'Update Expense' : 'Add Expense')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Modal */}
        {showAnalytics && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Expense Analytics</h3>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              
              {analytics ? (
                <div className="space-y-6">
                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-linear-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl">
                      <div className="text-2xl font-bold">₹{(analytics?.total_expenses || 0).toFixed(2)}</div>
                      <div className="text-blue-100">Total Expenses</div>
                    </div>
                    <div className="bg-linear-to-r from-green-500 to-green-600 text-white p-4 rounded-xl">
                      <div className="text-2xl font-bold">₹{(analytics?.average_daily || 0).toFixed(2)}</div>
                      <div className="text-green-100">Daily Average</div>
                    </div>
                    <div className="bg-linear-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl">
                      <div className="text-2xl font-bold">{analytics?.expense_count || 0}</div>
                      <div className="text-purple-100">Total Transactions</div>
                    </div>
                    <div className="bg-linear-to-r from-red-500 to-red-600 text-white p-4 rounded-xl">
                      <div className="text-2xl font-bold">₹{(analytics?.highest_expense || 0).toFixed(2)}</div>
                      <div className="text-red-100">Highest Expense</div>
                    </div>
                  </div>
                  
                  {/* Category Breakdown */}
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="text-lg font-semibold mb-4">Category Breakdown</h4>
                    <div className="space-y-3">
                      {Object.entries(analytics?.category_breakdown || {}).map(([category, amount]) => {
                        const percentage = (analytics?.total_expenses || 0) > 0 ? ((amount || 0) / analytics.total_expenses) * 100 : 0;
                        return (
                          <div key={category} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-4 h-4 rounded-full ${getCategoryColor(category)}`}></div>
                              <span className="font-medium">{category}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold">₹{(amount || 0).toFixed(2)}</div>
                              <div className="text-sm text-gray-500">{(percentage || 0).toFixed(1)}%</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Top Merchants */}
                  {(analytics?.top_merchants || []).length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <h4 className="text-lg font-semibold mb-4">Top Merchants</h4>
                      <div className="space-y-2">
                        {(analytics?.top_merchants || []).map((merchant, index) => (
                          <div key={index} className="flex items-center justify-between py-2">
                            <div>
                              <div className="font-medium">{merchant.merchant}</div>
                              <div className="text-sm text-gray-500">{merchant.count} transactions</div>
                            </div>
                            <div className="font-semibold">₹{(merchant.total || 0).toFixed(2)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading analytics...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Receipts Modal */}
        {showReceipts && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Receipts</h3>
                <button
                  onClick={() => setShowReceipts(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                >
                  ✕
                </button>
              </div>
              
              {receipts.length > 0 ? (
                <div className="space-y-4">
                  {receipts.map(receipt => (
                    <div key={receipt.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Receipt className="w-8 h-8 text-green-600" />
                          <div>
                            <div className="font-medium">{receipt.description || 'No description'}</div>
                            <div className="text-sm text-gray-500">
                              {receipt.merchant || 'Unknown Merchant'} • {new Date(receipt.expense_date || receipt.date || Date.now()).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">₹{(receipt.amount || 0).toFixed(2)}</div>
                          <div className="text-sm text-gray-500">{receipt.category || 'Uncategorized'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Receipt className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No receipts found. Add expenses with receipts to see them here.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartExpenseTracker;