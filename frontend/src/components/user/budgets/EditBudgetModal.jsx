import { useEffect, useState } from "react";

const EditBudgetModal = ({ open, onClose, budget, onSave }) => {
  const [category, setCategory] = useState("");
  const [limit, setLimit] = useState("");

  // preload budget data when modal opens
  useEffect(() => {
    if (budget) {
      setCategory(budget.category);
      setLimit(budget.limit_amount);
    }
  }, [budget]);

  if (!open || !budget) return null;

  const handleSave = () => {
    onSave({
      ...budget,
      category,
      limit_amount: Number(limit),
    });
    onClose();
  };

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">
            Edit Budget
          </h2>

          {/* CATEGORY */}
          <div className="mb-4">
            <label className="text-sm font-medium">Category</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          {/* LIMIT */}
          <div className="mb-6">
            <label className="text-sm font-medium">Budget Limit</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mt-1"
            />
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="text-gray-500"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditBudgetModal;
