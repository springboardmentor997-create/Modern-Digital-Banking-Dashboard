const BudgetProgress = ({ percent }) => {
  const color =
    percent >= 100
      ? "bg-red-500"
      : percent >= 80
      ? "bg-yellow-400"
      : "bg-green-500";

  return (
    <div className="w-full bg-gray-200 h-3 rounded">
      <div
        className={`h-3 rounded ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

export default BudgetProgress;
