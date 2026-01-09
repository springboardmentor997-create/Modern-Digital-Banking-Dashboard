import { PieChart, Pie, Cell } from "recharts";

/**
 * CircleMetric
 * - Percentage-based financial metric
 * - Premium fintech card styling
 */

const CircleMetric = ({ label, percent, color }) => {
  const safePercent = Math.min(Math.max(percent || 0, 0), 100);

  const data = [
    { value: safePercent },
    { value: 100 - safePercent },
  ];

  return (
    <div
      style={card}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-6px)";
        e.currentTarget.style.boxShadow =
          "0 22px 55px rgba(15,23,42,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 14px 36px rgba(15,23,42,0.10)";
      }}
    >
      <PieChart width={140} height={140}>
        <Pie
          data={data}
          innerRadius={52}
          outerRadius={64}
          dataKey="value"
          startAngle={90}
          endAngle={-270}
        >
          <Cell fill={color} />
          <Cell fill="#e5e7eb" />
        </Pie>
      </PieChart>

      <div style={center}>
        <div style={value}>{safePercent}%</div>
        <div style={labelStyle}>{label}</div>
      </div>
    </div>
  );
};

export default CircleMetric;

/* ===== STYLES ===== */

const card = {
  position: "relative",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
  padding: "30px",
  borderRadius: "22px",
  boxShadow: "0 14px 36px rgba(15,23,42,0.10)",
  display: "flex",
  justifyContent: "center",
  transition: "all 0.25s ease",
};

const center = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  textAlign: "center",
};

const value = {
  fontSize: "26px",
  fontWeight: 700,
  color: "#0f172a",
};

const labelStyle = {
  fontSize: "13px",
  color: "#64748b",
  marginTop: 4,
};
