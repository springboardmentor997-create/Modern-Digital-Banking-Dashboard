import React,{ useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Bell, CheckCircle, Clock, X, Save,AlertTriangle } from 'lucide-react';
import { getBills, addBill, updateBill, deleteBill, markPaid } from '../api/bills.js';
import toast from 'react-hot-toast';
import formatError from '../utils/formatError';
import { useNavigate } from 'react-router-dom';

export default function Bills() {
  const [bills, setBills] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentBill, setCurrentBill] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    biller_name: '',
    due_date: '',
    amount_due: '',
    status: 'upcoming',
    auto_pay: false
  });

  const statusOptions = ['upcoming', 'paid', 'overdue'];
  const navigate = useNavigate();

  useEffect(() => {
    loadBills();
  }, []);

  async function loadBills() {
    try {
      const data = await getBills();
      setBills(data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setErrors({ ...errors, [name]: '' });
  }

  function validateForm() {
    const newErrors = {};
    if (!form.biller_name.trim()) newErrors.biller_name = 'Biller name is required';
    if (!form.due_date) newErrors.due_date = 'Due date is required';
    if (!form.amount_due || parseFloat(form.amount_due) <= 0)
      newErrors.amount_due = 'Amount must be greater than 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      biller_name: form.biller_name,
      due_date: form.due_date,
      amount_due: parseFloat(form.amount_due),
      status: form.status,
      auto_pay: form.auto_pay,
    };

    try {
      editMode
        ? await updateBill(currentBill.id, payload)
        : await addBill(payload);

      await loadBills();
      closeModal();
      toast.success(editMode ? 'Bill updated!' : 'Bill added!');
    } catch (err) {
      toast.error(formatError(err));
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this bill?')) return;
    try {
      await deleteBill(id);
      await loadBills();
      toast.success('Bill deleted!');
    } catch (err) {
      toast.error(formatError(err));
    }
  }

  async function markAsPaid(id) {
    try {
      // Ask user to choose account id to pay from (quick UX); ideally show account picker modal
      const acct = window.prompt('Enter account id to pay from (leave blank to skip transaction record):');
      const account_id = acct ? Number(acct) : null;
      await markPaid(id, account_id);
      await loadBills();
      toast.success('Bill marked as paid!');
      if (account_id) {
        // let Transactions page select this account and show the new txn
        localStorage.setItem('selected_account', String(account_id));
        navigate('/transactions');
      }
    } catch (err) {
      toast.error(formatError(err));
    }
  }

  function openAddModal() {
    setEditMode(false);
    setCurrentBill(null);
    setForm({
      biller_name: '',
      due_date: '',
      amount_due: '',
      status: 'upcoming',
      auto_pay: false,
    });
    setErrors({});
    setShowModal(true);
  }

  function openEditModal(bill) {
    setEditMode(true);
    setCurrentBill(bill);
    setForm({
      biller_name: bill.biller_name,
      due_date: bill.due_date,
      amount_due: bill.amount_due.toString(),
      status: bill.status,
      auto_pay: bill.auto_pay,
    });
    setErrors({});
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditMode(false);
    setCurrentBill(null);
    setErrors({});
  }

  function getStatusBadge(status) {
    if (status === 'upcoming') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          <Clock className="w-4 h-4" /> Upcoming
        </span>
      );
    }
    if (status === 'paid') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
          <CheckCircle className="w-4 h-4" /> Paid
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
        <AlertTriangle className="w-4 h-4" /> Overdue
      </span>
    );
  }

  const upcomingBills = bills.filter(b => b.status === 'upcoming');
  const totalDue = upcomingBills.reduce((sum, b) => sum + parseFloat(b.amount_due), 0);

  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bills & Payments</h1>
            <p className="text-gray-600 mt-1">Track and manage your recurring payments</p>
          </div>
          <button
            onClick={openAddModal}
            className="px-5 py-2 bg-orange-600 text-white rounded-lg font-medium flex items-center gap-2 hover:bg-orange-700"
          >
            <Plus className="w-5 h-5" />
            Add Bill
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-orange-500">
            <p className="text-sm text-gray-500 mb-1">Total Due</p>
            <p className="text-3xl font-bold text-orange-600">₹{totalDue.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-500 mb-1">Upcoming Bills</p>
            <p className="text-3xl font-bold text-blue-600">{upcomingBills.length}</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-green-500">
            <p className="text-sm text-gray-500 mb-1">Auto-Pay Enabled</p>
            <p className="text-3xl font-bold text-green-600">
              {bills.filter(b => b.auto_pay).length}
            </p>
          </div>
        </div>

        {bills.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Bills Added</h3>
            <p className="text-gray-600 mb-6">Add your first bill to start tracking payments</p>
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-orange-600 text-white rounded-xl font-medium inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add First Bill
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bills.map((bill) => (
              <div key={bill.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{bill.biller_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Calendar className="w-4 h-4" />
                      Due: {new Date(bill.due_date).toLocaleDateString()}
                    </div>
                  </div>
                  {bill.auto_pay && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                      Auto-Pay
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  {getStatusBadge(bill.status)}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-1">Amount Due</p>
                  <p className="text-2xl font-bold text-gray-900">₹{parseFloat(bill.amount_due).toFixed(2)}</p>
                </div>

                <div className="flex gap-2">
                  {bill.status === 'upcoming' && (
                    <button
                      onClick={() => markAsPaid(bill.id)}
                      className="flex-1 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 text-sm"
                    >
                      Mark Paid
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(bill)}
                    className="flex-1 py-2 border-2 border-orange-600 text-orange-600 rounded-lg font-medium hover:bg-orange-50 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(bill.id)}
                    className="px-3 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editMode ? 'Edit Bill' : 'Add Bill'}
                </h2>
                <button onClick={closeModal} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Biller Name *</label>
                  <input
                    name="biller_name"
                    type="text"
                    placeholder="Netflix"
                    value={form.biller_name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500"
                  />
                  {errors.biller_name && <p className="text-red-500 text-sm mt-1">{errors.biller_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                  <input
                    name="due_date"
                    type="date"
                    value={form.due_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500"
                  />
                  {errors.due_date && <p className="text-red-500 text-sm mt-1">{errors.due_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount Due *</label>
                  <input
                    name="amount_due"
                    type="number"
                    step="0.01"
                    placeholder="15.99"
                    value={form.amount_due}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500"
                  />
                  {errors.amount_due && <p className="text-red-500 text-sm mt-1">{errors.amount_due}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    name="auto_pay"
                    type="checkbox"
                    id="auto_pay"
                    checked={form.auto_pay}
                    onChange={handleChange}
                    className="w-5 h-5 accent-orange-600 rounded"
                  />
                  <label htmlFor="auto_pay" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Enable Auto-Pay
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={closeModal}
                    className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    {editMode ? 'Update' : 'Add'}
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