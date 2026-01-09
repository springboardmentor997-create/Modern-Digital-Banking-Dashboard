import BudgetProgress from "./BudgetProgress";

const BudgetCard = ({ budget, onEdit, onRemove }) => {
  const percent =
    budget.limit_amount > 0
      ? Math.min(
          (budget.spent_amount / budget.limit_amount) * 100,
          100
        )
      : 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm flex justify-between items-start">
      
      {/* LEFT */}
      <div className="flex-1">
        <h3 className="text-lg font-semibold">
          {budget.category}
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          ₹{budget.spent_amount} spent of ₹{budget.limit_amount}
        </p>

        <div className="mt-3">
          <BudgetProgress percent={percent} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex flex-col items-end gap-2 ml-6">
        <span
          className={`text-sm font-medium ${
            percent >= 100
              ? "text-red-600"
              : percent >= 80
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {percent >= 100
            ? "Limit Exceeded"
            : percent >= 80
            ? "Near Limit"
            : "On Track"}
        </span>

        <button
          onClick={() => onEdit(budget)}
          className="bg-blue-600 hover:bg-blue-700
                   text-white px-4 py-1.5
                   rounded-full text-sm font-medium
                   shadow-sm"
        >
          Edit
        </button>

        <button
          onClick={() => onRemove(budget)}
          className="text-sm text-red-600 hover:underline"
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default BudgetCard;
