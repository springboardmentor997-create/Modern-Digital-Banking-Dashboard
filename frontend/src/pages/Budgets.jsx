import React,{ useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, AlertCircle, CheckCircle, PieChart, Calendar, X, Save } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [errors, setErrors] = useState({});
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    category: 'Food',
    limit_amount: '',
    spent_amount: '0'
  });

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Healthcare', 'Other'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  useEffect(() => {
    fetchBudgets();
  }, [selectedMonth, selectedYear]);

  async function fetchBudgets() {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`/api/budgets?month=${selectedMonth}&year=${selectedYear}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBudgets(data);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: '' });
  }

  function validateForm() {
    const newErrors = {};

    if (!form.category) {
      newErrors.category = 'Category is required';
    }

    if (!form.limit_amount || parseFloat(form.limit_amount) <= 0) {
      newErrors.limit_amount = 'Budget limit must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const token = localStorage.getItem('access_token');
    const url = editMode ? `/api/budgets/${currentBudget.id}` : '/api/budgets';
    const method = editMode ? 'PUT' : 'POST';

    const payload = {
      month: parseInt(form.month),
      year: parseInt(form.year),
      category: form.category,
      limit_amount: parseFloat(form.limit_amount),
      spent_amount: parseFloat(form.spent_amount)
    };

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchBudgets();
        closeModal();
        toast.success(editMode ? 'Budget updated!' : 'Budget created!');
      } else {
        const error = await response.json();
        toast.error('Error: ' + (error.detail || 'Something went wrong'));
      }
    } catch (error) {
      toast.error('Network error: ' + error.message);
    }
  }

  async function handleDelete(budgetId) {
    if (!confirm('Delete this budget?')) return;

    const token = localStorage.getItem('access_token');
    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchBudgets();
        toast.success('Budget deleted!');
      }
    } catch (error) {
      toast.error('Network error: ' + error.message);
    }
  }

  function openAddModal() {
    setEditMode(false);
    setCurrentBudget(null);
    setForm({
      month: selectedMonth,
      year: selectedYear,
      category: 'Food',
      limit_amount: '',
      spent_amount: '0'
    });
    setErrors({});
    setShowModal(true);
  }

  function openEditModal(budget) {
    setEditMode(true);
    setCurrentBudget(budget);
    setForm({
      month: budget.month,
      year: budget.year,
      category: budget.category,
      limit_amount: budget.limit_amount.toString(),
      spent_amount: budget.spent_amount.toString()
    });
    setErrors({});
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditMode(false);
    setCurrentBudget(null);
    setErrors({});
  }

  function getProgressColor(percentage) {
    if (percentage < 50) return 'bg-green-500';
    if (percentage < 75) return 'bg-yellow-500';
    if (percentage < 90) return 'bg-orange-500';
    return 'bg-red-500';
  }

  function getBudgetStatus(spent, limit) {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return { text: 'Exceeded', color: 'text-red-600', icon: AlertCircle };
    if (percentage >= 90) return { text: 'Critical', color: 'text-orange-600', icon: AlertCircle };
    if (percentage >= 75) return { text: 'High', color: 'text-yellow-600', icon: TrendingUp };
    return { text: 'On Track', color: 'text-green-600', icon: CheckCircle };
  }

  const totalLimit = budgets.reduce((sum, b) => sum + parseFloat(b.limit_amount), 0);
  const totalSpent = budgets.reduce((sum, b) => sum + parseFloat(b.spent_amount), 0);
  const totalRemaining = totalLimit - totalSpent;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budget Manager</h1>
            <p className="text-gray-600 mt-1">Plan and track your spending limits</p>
          </div>
          <button
            onClick={openAddModal}
            className="px-5 py-2 bg-green-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-green-700"
          >
            <Plus className="w-5 h-5" />
            Add Budget
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <Calendar className="w-6 h-6 text-gray-600" />
            <h3 className="text-lg font-bold text-gray-900">Select Period</h3>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500"
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-green-500"
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-500 mb-1">Total Budget</p>
            <p className="text-3xl font-bold text-gray-900">${totalLimit.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
            <p className="text-sm text-gray-500 mb-1">Total Spent</p>
            <p className="text-3xl font-bold text-orange-600">${totalSpent.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
            <p className="text-sm text-gray-500 mb-1">Remaining</p>
            <p className={`text-3xl font-bold ${totalRemaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${Math.abs(totalRemaining).toFixed(2)}
            </p>
          </div>
        </div>

        {budgets.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Budgets Set</h3>
            <p className="text-gray-600 mb-6">Create your first budget to start tracking spending</p>
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-green-600 text-white rounded-xl font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Budget
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {budgets.map((budget) => {
              const percentage = (parseFloat(budget.spent_amount) / parseFloat(budget.limit_amount)) * 100;
              const status = getBudgetStatus(parseFloat(budget.spent_amount), parseFloat(budget.limit_amount));
              const StatusIcon = status.icon;

              return (
                <div key={budget.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{budget.category}</h3>
                      <p className="text-sm text-gray-500">{months[budget.month - 1]} {budget.year}</p>
                    </div>
                    <div className={`flex items-center gap-1 ${status.color}`}>
                      <StatusIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">{status.text}</span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Spent</span>
                      <span className="font-bold">${parseFloat(budget.spent_amount).toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-4 ${getProgressColor(percentage)} transition-all`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm mt-2">
                      <span className="text-gray-600">Limit</span>
                      <span className="font-bold">${parseFloat(budget.limit_amount).toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Remaining</span>
                      <span className={`text-lg font-bold ${parseFloat(budget.limit_amount) - parseFloat(budget.spent_amount) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(parseFloat(budget.limit_amount) - parseFloat(budget.spent_amount)).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {percentage.toFixed(1)}% used
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => openEditModal(budget)}
                      className="flex-1 py-2 border-2 border-green-600 text-green-600 rounded-lg font-medium hover:bg-green-50 flex items-center justify-center gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(budget.id)}
                      className="flex-1 py-2 border-2 border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editMode ? 'Edit Budget' : 'Create Budget'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
                    <select
                      name="month"
                      value={form.month}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500"
                    >
                      {months.map((month, index) => (
                        <option key={index} value={index + 1}>{month}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                    <select
                      name="year"
                      value={form.year}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500"
                    >
                      {[2023, 2024, 2025, 2026].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Limit *</label>
                  <input
                    name="limit_amount"
                    type="number"
                    step="0.01"
                    placeholder="1000.00"
                    value={form.limit_amount}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500"
                  />
                  {errors.limit_amount && <p className="text-red-500 text-sm mt-1">{errors.limit_amount}</p>}
                </div>

                {editMode && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Spent Amount</label>
                    <input
                      name="spent_amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={form.spent_amount}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {editMode ? 'Update' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}