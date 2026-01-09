import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#2563EB", "#DC2626", "#16A34A", "#F59E0B"];

const CategoryBreakdownChart = ({ data }) => {
  if (!data || data.length === 0) {
    return <p style={{ color: "#64748b" }}>No data available</p>;
  }

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          outerRadius={90}
          label={({ category, amount }) => {
            const percent = ((amount / total) * 100).toFixed(1);
            return `${category} (${percent}%)`;
          }}
        >
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>

        <Tooltip
          formatter={(value, name) => [`₹ ${value}`, name]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default CategoryBreakdownChart;
