import { useEffect, useState } from "react";
import { getBudgets } from "@/services/api";

const BudgetSummary = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  const month = new Date().getMonth() + 1;
  const year = new Date().getFullYear();

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await getBudgets(month, year);
      setBudgets(res.data);
    } catch (err) {
      console.error("Failed to load budget summary", err);
    } finally {
      setLoading(false);
    }
  };

  const totalLimit = budgets.reduce(
    (sum, b) => sum + Number(b.limit_amount || 0),
    0
  );

  const totalSpent = budgets.reduce(
    (sum, b) => sum + Number(b.spent_amount || 0),
    0
  );

  const remaining = totalLimit - totalSpent;

  if (loading) {
    return <div className="p-6">Loading summary...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Budget Summary</h1>
        <p className="text-sm text-gray-500">
          Overview for {month}/{year}
        </p>
      </div>

      {/* TOTAL SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard title="Total Budget" value={`₹${totalLimit}`} />
        <SummaryCard title="Total Spent" value={`₹${totalSpent}`} />
        <SummaryCard title="Remaining" value={`₹${remaining}`} />
      </div>

      {/* CATEGORY BREAKDOWN */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">
          Category-wise Breakdown
        </h2>

        {budgets.length === 0 ? (
          <p className="text-gray-500 text-sm">
            No budgets found for this month.
          </p>
        ) : (
          <div className="space-y-3">
            {budgets.map((b) => {
              const percent =
                b.limit_amount > 0
                  ? Math.min(
                      (b.spent_amount / b.limit_amount) * 100,
                      100
                    )
                  : 0;

              return (
                <div key={b.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{b.category}</p>
                      <p className="text-sm text-gray-500">
                        ₹{b.spent_amount} / ₹{b.limit_amount}
                      </p>
                    </div>

                    <span
                      className={`text-sm font-medium ${
                        percent >= 100
                          ? "text-red-600"
                          : percent >= 80
                          ? "text-yellow-600"
                          : "text-green-600"
                      }`}
                    >
                      {percent.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const SummaryCard = ({ title, value }) => (
  <div className="bg-white rounded-xl p-4 shadow-sm">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-xl font-semibold">{value}</p>
  </div>
);

export default BudgetSummary;
