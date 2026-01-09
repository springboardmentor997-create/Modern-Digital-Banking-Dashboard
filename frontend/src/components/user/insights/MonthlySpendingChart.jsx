import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const MonthlySpendingChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p style={{ color: "#64748b" }}>No data available</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          label={{
            value: "Date",
            position: "insideBottom",
            offset: -5,
          }}
        />

        <YAxis
          tick={{ fontSize: 12 }}
          label={{
            value: "Amount (₹)",
            angle: -90,
            position: "insideLeft",
          }}
        />

        <Tooltip
          formatter={(value) => [`₹ ${value}`, "Spent"]}
          labelFormatter={(label) => `Date: ${label}`}
        />

        <Line
          type="monotone"
          dataKey="amount"
          stroke="#DC2626"
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MonthlySpendingChart;
