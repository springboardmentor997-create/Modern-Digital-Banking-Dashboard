const BudgetWarning = ({ data, onContinue, onCancel }) => {
  if (!data) return null;

  return (
    <div className="bg-red-50 border border-red-300 p-4 rounded-lg mb-4">
      <p className="text-red-700 font-medium">
        This payment exceeds your {data.budget.category} budget by ₹
        {data.exceededBy}
      </p>

      <div className="flex justify-end gap-3 mt-3">
        <button
          onClick={onCancel}
          className="text-sm text-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={onContinue}
          className="bg-red-600 text-white px-4 py-1.5 rounded-md text-sm"
        >
          Proceed Anyway
        </button>
      </div>
    </div>
  );
};

export default BudgetWarning;
