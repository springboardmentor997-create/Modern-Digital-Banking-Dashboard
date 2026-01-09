import { X } from "lucide-react";
import { useState, useEffect } from "react";

const AddBillModal = ({ onClose, onAdd, accounts, initialData }) => {
  const [form, setForm] = useState({
    billerName: "",
    dueDate: "",
    amount: "",
    account: "",
    status: "Upcoming",
    autoPay: false,
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        billerName: initialData.billerName || "",
        dueDate: initialData.dueDate || "",
        amount: initialData.amount || "",
        account: initialData.account || "",
        status: initialData.status || "",
        autoPay: initialData.autoPay || false,
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = () => {
    if (!form.billerName || !form.dueDate || !form.amount || !form.account) {
      alert("Please fill in all required fields.");
      return;
    }
    onAdd(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {initialData ? "Edit Bill" : "Add Bill"}
          </h2>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-gray-500 hover:text-black" />
          </button>
        </div>

        {/* ✅ FORM START */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {/* FORM FIELDS */}
          <div className="space-y-4">
            {/* Biller Name */}
            <div>
              <label className="text-sm font-medium">Biller Name *</label>
              <input
                type="text"
                name="billerName"
                placeholder="Netflix"
                value={form.billerName}
                onChange={handleChange}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="text-sm font-medium">Due Date *</label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="text-sm font-medium">Amount Due *</label>
              <input
                type="number"
                name="amount"
                placeholder="399"
                value={form.amount}
                onChange={handleChange}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Account */}
            <div>
              <label className="text-sm font-medium">Account</label>
              <select
                name="account"
                value={form.account}
                onChange={handleChange}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select Account</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.bank_name} - {acc.account_number} ({acc.currency})
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full mt-1 border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Select</option>
                <option>Upcoming</option>
                <option>Paid</option>
                <option>Overdue</option>
              </select>
            </div>

            {/* Auto Pay */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="autoPay"
                checked={form.autoPay}
                onChange={handleChange}
              />
              <span className="text-sm">Enable Auto-Pay</span>
            </div>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600"
            >
              {initialData ? "Update Bill" : "Add Bill"}
            </button>
          </div>
        </form>
        {/* ✅ FORM END */}
      </div>
    </div>
  );
};

export default AddBillModal;
