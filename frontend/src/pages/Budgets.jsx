import { useState, useEffect } from 'react';
import { PieChart, Plus, TrendingUp, Trash2 } from 'lucide-react';
// import Navbar from '../components/Navbar'; // Removed Navbar import
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import { getBudgets, createBudget, deleteBudget } from '../api/budgets';

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    category: 'Food',
    limit: '',
    period: 'Monthly'
  });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const data = await getBudgets();
      setBudgets(data);
    } catch (error) {
      console.error('Failed to fetch budgets:', error);
    } finally {
      setLoading(false);
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
      await createBudget({
        ...formData,
        limit: parseFloat(formData.limit)
      });
      await fetchBudgets();
      setIsModalOpen(false);
      setFormData({
        category: 'Food',
        limit: '',
        period: 'Monthly'
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create budget');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        await deleteBudget(id);
        await fetchBudgets();
      } catch (error) {
        console.error('Failed to delete budget:', error);
        alert('Failed to delete budget');
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="flex flex-col h-full">
      {/* <Navbar title="Budget" /> */} {/* Removed Navbar component */}
      
      <div className="p-6 flex-1 overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Monthly Budgets</h2>
            <p className="text-gray-500 text-sm">Track your spending across categories</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Plus size={20} />
            <span>Create Budget</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => {
            const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
            const isOverBudget = budget.spent > budget.limit;

            return (
              <div key={budget.id} className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow relative group">
                <button
                  onClick={() => handleDelete(budget.id)}
                  className="absolute bottom-4 right-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete Budget"
                >
                  <Trash2 size={18} />
                </button>

                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isOverBudget ? 'bg-red-100 text-red-600' : 'bg-sky-100 text-sky-600'}`}>
                      <PieChart size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{budget.category}</h3>
                      <p className="text-xs text-gray-500">{budget.period}</p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                    {percentage.toFixed(0)}%
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">Spent: ₹{budget.spent.toLocaleString()}</span>
                    <span className="text-gray-900 font-medium">Limit: ₹{budget.limit.toLocaleString()}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isOverBudget ? 'bg-red-500' : 'bg-sky-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <TrendingUp size={14} />
                  <span>
                    {isOverBudget 
                      ? `Over budget by ₹${(budget.spent - budget.limit).toLocaleString()}`
                      : `₹${(budget.limit - budget.spent).toLocaleString()} remaining`
                    }
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Budget"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="Food">Food</option>
              <option value="Transport">Transport</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Utilities">Utilities</option>
              <option value="Shopping">Shopping</option>
              <option value="Health">Health</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Limit</label>
            <input
              type="number"
              name="limit"
              value={formData.limit}
              onChange={handleInputChange}
              required
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
            <select
              name="period"
              value={formData.period}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="Monthly">Monthly</option>
              <option value="Weekly">Weekly</option>
              <option value="Yearly">Yearly</option>
            </select>
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
              className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Budgets;