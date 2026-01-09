import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const InsightsChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div style={card}>
        <h3>Income vs Expense (Last 15 Days)</h3>
        <p style={{ color: "#64748b" }}>No insights data available</p>
      </div>
    );
  }

  return (
    <div
      style={card}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow =
          "0 24px 60px rgba(15,23,42,0.14)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 16px 42px rgba(15,23,42,0.10)";
      }}
    >
      <h3>Income vs Expense (Last 15 Days)</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="income" fill="#16a34a" radius={[6, 6, 0, 0]} />
          <Bar dataKey="expense" fill="#dc2626" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InsightsChart;

/* ===== STYLES ===== */

const card = {
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  padding: "28px",
  borderRadius: 22,
  boxShadow: "0 16px 42px rgba(15,23,42,0.10)",
  marginBottom: 36,
  transition: "all 0.25s ease",
};
