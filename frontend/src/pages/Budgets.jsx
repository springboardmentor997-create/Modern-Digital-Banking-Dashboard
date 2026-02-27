import React, { useState, useEffect } from 'react';
import { PieChart, Plus, TrendingUp, Trash2, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { getBudgets, createBudget, deleteBudget, getCategories } from '../api/budgets';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category_id: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      console.log('🏦 Budgets Page - Fetching data');
      
      const [budgetsData, categoriesData] = await Promise.all([
        getBudgets(),
        getCategories()
      ]);
      
      console.log('📊 Categories received:', categoriesData);
      console.log('💰 Budgets received:', budgetsData);
      
      setBudgets(budgetsData || []);
      setCategories(categoriesData || []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError('Could not load categories or budgets. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      // Ensure we store exactly what the user selects
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.category_id) {
      setError("Please select a category");
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        amount: parseFloat(formData.amount),
        category_id: parseInt(formData.category_id), // ✅ Vital for backend
        month: parseInt(formData.month),
        year: parseInt(formData.year)
      };

      console.log("🚀 Creating Budget with payload:", payload);
      await createBudget(payload);
      
      await fetchData();
      setIsModalOpen(false);
      
      // Reset Form
      setFormData({
        name: '',
        amount: '',
        category_id: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      });
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to create budget';
      setError(typeof msg === 'object' ? JSON.stringify(msg) : msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(id);
        await fetchData();
      } catch (error) {
        console.error('Failed to delete budget:', error);
        alert('Failed to delete budget');
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <Navbar title="Budgets" />
      
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Monthly Budgets</h2>
            <p className="text-gray-600 text-sm">Control your spending habits</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white px-5 py-2.5 rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all shadow-md active:scale-95"
          >
            <Plus size={20} />
            <span className="font-semibold">Create Budget</span>
          </button>
        </div>

        {budgets.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
             <PieChart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
             <p className="text-gray-500 text-lg">No budgets set yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => {
              const spentAmount = parseFloat(budget.spent || 0);
              const limitAmount = parseFloat(budget.amount || 1);
              const percentage = Math.min((spentAmount / limitAmount) * 100, 100);
              const isOverBudget = spentAmount > limitAmount;

              return (
                <div key={budget.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative group">
                  <button
                    onClick={() => handleDelete(budget.id)}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isOverBudget ? 'bg-red-100 text-red-600' : 'bg-sky-100 text-sky-600'}`}>
                        <PieChart size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{budget.name}</h3>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{budget.category_name || 'General'}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${isOverBudget ? 'text-red-600' : 'text-sky-600'}`}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-gray-500">Spent: <span className="font-bold text-gray-700">₹{spentAmount.toLocaleString()}</span></span>
                      <span className="text-gray-500">Limit: <span className="font-bold text-gray-700">₹{limitAmount.toLocaleString()}</span></span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${
                          isOverBudget ? 'bg-red-500' : percentage > 80 ? 'bg-amber-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium">
                    {isOverBudget ? (
                      <div className="flex items-center gap-1 text-red-600">
                        <AlertCircle size={14} />
                        <span>Over budget by ₹{(spentAmount - limitAmount).toLocaleString()}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-emerald-600">
                        <TrendingUp size={14} />
                        <span>₹{(limitAmount - spentAmount).toLocaleString()} left to spend</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Budget"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Budget Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
              placeholder="e.g., Groceries"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all"
            >
              <option value="">-- Choose Category --</option>
              {Array.isArray(categories) && categories.map((category, index) => {
                // Handle both object and string formats
                const id = typeof category === 'object' ? category.id : index + 1;
                const name = typeof category === 'object' ? category.name : category;
                const icon = typeof category === 'object' ? category.icon : '';
                
                return (
                  <option key={`category-${id}`} value={id}>
                    {icon} {name}
                  </option>
                );
              })}
            </select>
            {categories.length === 0 && <p className="text-[10px] text-amber-600 mt-1">Warning: No categories found on server.</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Budget Amount (₹)</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              step="0.01"
              min="1"
              className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none transition-all font-bold"
              placeholder="0.00"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Month</label>
              <select
                name="month"
                value={formData.month}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              >
                {Array.from({length: 12}, (_, i) => (
                  <option key={`month-${i + 1}`} value={i + 1}>
                    {new Date(0, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Year</label>
              <select
                name="year"
                value={formData.year}
                onChange={handleInputChange}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
              >
                {[0, 1, 2].map(i => {
                  const yr = new Date().getFullYear() + i;
                  return <option key={`year-${yr}`} value={yr}>{yr}</option>;
                })}
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2.5 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 bg-sky-600 text-white rounded-xl hover:bg-sky-700 font-bold shadow-lg shadow-sky-100 disabled:opacity-50 transition-all"
            >
              {submitting ? 'Saving...' : 'Create Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Budgets;