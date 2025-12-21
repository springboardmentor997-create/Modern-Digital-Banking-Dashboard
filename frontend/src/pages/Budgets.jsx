import React, { useState,useEffect } from "react";
import { Plus, Edit2, Trash2, AlertCircle, CheckCircle, PieChart, X, Save } from "lucide-react";
import { getBudgets,createBudget,updateBudget,deleteBudget } from "../api/budgets";

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBudget, setCurrentBudget] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().getMonth() + 1
  );
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear()
  );
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    month: selectedMonth,
    year: selectedYear,
    category: "Food",
    limit_amount: "",
    spent_amount: "0",
  });

  const categories = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Healthcare",
    "Other",
  ];

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    loadBudgets();
  }, [selectedMonth, selectedYear]);

  const loadBudgets = async () => {
    try {
      setLoading(true);
      const data = await getBudgets(selectedMonth, selectedYear);
      setBudgets(Array.isArray(data) ? data : []);
    } catch (e) {
      showToast(e.message, "error");
      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.limit_amount || form.limit_amount <= 0) {
      showToast("Please enter a valid limit amount", "error");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        month: Number(form.month),
        year: Number(form.year),
        category: form.category,
        limit_amount: Number(form.limit_amount),
        spent_amount: Number(form.spent_amount),
      };

      if (editMode) {
        await updateBudget(currentBudget.id, payload);
        showToast("Budget updated", "success");
      } else {
        await createBudget(payload);
        showToast("Budget created", "success");
      }

      setShowModal(false);
      resetForm();
      loadBudgets();
    } catch (e) {
      showToast(e.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this budget?")) return;

    try {
      await deleteBudget(id);
      showToast("Budget deleted", "success");
      loadBudgets();
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  const resetForm = () => {
    setForm({
      month: selectedMonth,
      year: selectedYear,
      category: "Food",
      limit_amount: "",
      spent_amount: "0",
    });
  };

  const openEditModal = (b) => {
    setEditMode(true);
    setCurrentBudget(b);
    setForm({
      month: b.month,
      year: b.year,
      category: b.category,
      limit_amount: b.limit_amount.toString(),
      spent_amount: b.spent_amount.toString(),
    });
    setShowModal(true);
  };

  const openAddModal = () => {
    setEditMode(false);
    setCurrentBudget(null);
    resetForm();
    setShowModal(true);
  };

  const getProgressPercentage = (spent, limit) => {
    return Math.min((spent / limit) * 100, 100);
  };

  const getStatusColor = (spent, limit) => {
    const percentage = getProgressPercentage(spent, limit);
    if (percentage >= 100) return "bg-red-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const filteredBudgets = budgets.filter(b => b.month === selectedMonth && b.year === selectedYear);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Budget Manager</h1>
          <button
            onClick={openAddModal}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex gap-2 items-center shadow-lg transition"
          >
            <Plus size={20} /> Add Budget
          </button>
        </div>

        {/* Month/Year Selector */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {months.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {[2023, 2024, 2025, 2026].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
            toast.type === "success" 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {toast.type === "success" ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            {toast.message}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white p-16 rounded-xl text-center shadow">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading budgets...</p>
          </div>
        )}

        {/* Budgets Grid */}
        {!loading && filteredBudgets.length === 0 ? (
          <div className="bg-white p-16 rounded-xl text-center shadow">
            <PieChart className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500 text-lg">No budgets found for {months[selectedMonth - 1]} {selectedYear}</p>
          </div>
        ) : (
          !loading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBudgets.map((b) => {
                const spent = Number(b.spent_amount);
                const limit = Number(b.limit_amount);
                const percentage = getProgressPercentage(spent, limit);
                const isOverBudget = spent > limit;

                return (
                  <div key={b.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-800">{b.category}</h3>
                        <p className="text-sm text-gray-500">{months[b.month - 1]} {b.year}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-semibold text-gray-700 mr-2">Spent</span>
                        <span className={`text-sm font-bold ${isOverBudget ? "text-red-600" : "text-gray-800"}`}>
                          ${spent.toFixed(2)} / ${limit.toFixed(2)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all ${getStatusColor(spent, limit)}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOverBudget && (
                        <div className="flex items-center gap-1 text-red-600 text-sm font-semibold">
                          <AlertCircle size={16} />
                          Over budget by ${(spent - limit).toFixed(2)}
                        </div>
                      )}
                      {!isOverBudget && (
                        <div className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                          <CheckCircle size={16} />
                          ${(limit - spent).toFixed(2)} remaining
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-xl w-full max-w-md shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-2xl text-gray-800">
                  {editMode ? "Edit Budget" : "Create Budget"}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    disabled={submitting}
                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Month
                  </label>
                  <select
                    value={form.month}
                    onChange={(e) => setForm({ ...form, month: Number(e.target.value) })}
                    disabled={submitting}
                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {months.map((m, i) => (
                      <option key={i} value={i + 1}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Year
                  </label>
                  <select
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                    disabled={submitting}
                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {[2023, 2024, 2025, 2026].map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Budget Limit ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={form.limit_amount}
                    onChange={(e) => setForm({ ...form, limit_amount: e.target.value })}
                    disabled={submitting}
                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Amount Spent ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={form.spent_amount}
                    onChange={(e) => setForm({ ...form, spent_amount: e.target.value })}
                    disabled={submitting}
                    className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Save size={18} />
                  {submitting ? "Saving..." : (editMode ? "Update Budget" : "Create Budget")}
                </button>

                <button
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="w-full border border-gray-300 text-gray-700 py-2 rounded font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}