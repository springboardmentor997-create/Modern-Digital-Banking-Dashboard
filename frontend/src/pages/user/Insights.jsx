/**
 * Financial insights page
 *
 * Route:
 * - /dashboard/insights
 *
 * Purpose:
 * Dynamic analytics using backend data
 */

import { useEffect, useState } from "react";
import {
  getInsightsSummary,
  getMonthlySpending,
  getCategoryBreakdown,
} from "@/services/api";

import MonthlySpendingChart from "@/components/user/insights/MonthlySpendingChart";
import CategoryBreakdownChart from "@/components/user/insights/CategoryBreakdownChart";

/* ---------- CONSTANTS ---------- */

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const YEARS = [2023, 2024, 2025, 2026];

const Insights = () => {
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [savings, setSavings] = useState(0);

  const [monthlyData, setMonthlyData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const [loading, setLoading] = useState(true);

  const loadInsights = async () => {
    try {
      setLoading(true);

      const [summaryRes, monthlyRes, categoryRes] = await Promise.all([
        getInsightsSummary(),
        getMonthlySpending(month, year),
        getCategoryBreakdown(month, year),
      ]);

      setIncome(summaryRes.data.total_income || 0);
      setExpense(summaryRes.data.total_expense || 0);
      setSavings(summaryRes.data.savings || 0);

      setMonthlyData(monthlyRes.data || []);
      setCategoryData(categoryRes.data || []);
    } catch (err) {
      console.error("Insights load failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [month, year]);

  return (
    <div>
      {/* HEADER */}
      <div style={headerWrap}>
        <h1 style={pageTitle}>Insights</h1>
        <p style={pageSub}>
          Analyze your income, expenses, and spending trends
        </p>
      </div>

      {/* FILTER BAR */}
      <div style={filterBar}>
        <div style={filterTitle}>
          {MONTHS[month - 1]} {year}
        </div>

        <div style={filterControls}>
          {/* MONTH (numeric) */}
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            style={filterSelect}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          {/* YEAR */}
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            style={filterSelect}
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SUMMARY */}
      <div style={summaryRow}>
        <InsightCard title="Total Income" value={income} accent="#2563EB" />
        <InsightCard title="Total Expense" value={expense} accent="#DC2626" />
        <InsightCard title="Savings" value={savings} accent="#16A34A" />
      </div>

      {/* CHARTS */}
      <div style={chartsRow}>
        <ChartCard title="Monthly Spending">
          {loading ? "Loading…" : <MonthlySpendingChart data={monthlyData} />}
        </ChartCard>

        <ChartCard title="Category Breakdown">
          {loading ? "Loading…" : (
            <CategoryBreakdownChart data={categoryData} />
          )}
        </ChartCard>
      </div>

      {/* EMPTY STATE */}
      {!loading && income === 0 && expense === 0 && (
        <div style={emptyState}>
          <h3>No Insights Yet</h3>
          <p>Start making transactions to see insights here.</p>
        </div>
      )}
    </div>
  );
};

export default Insights;

/* ================= STYLES ================= */

const headerWrap = {
  textAlign: "center",
  marginBottom: "28px",
};

const pageTitle = { fontSize: "26px", marginBottom: "6px" };
const pageSub = { color: "#64748b", fontSize: "14px" };

const filterBar = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "#ffffff",
  padding: "16px 22px",
  borderRadius: "18px",
  boxShadow: "0 10px 28px rgba(0,0,0,0.08)",
  margin: "20px 0 32px",
};

const filterTitle = {
  fontSize: "18px",
  fontWeight: 600,
  color: "#0f172a",
};

const filterControls = {
  display: "flex",
  gap: "12px",
};

const filterSelect = {
  border: "1px solid #e5e7eb",
  borderRadius: "10px",
  padding: "8px 14px",
  fontSize: "14px",
  cursor: "pointer",
  background: "#fff",
};

const summaryRow = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "20px",
  marginBottom: "36px",
};

const chartsRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "28px",
};

const emptyState = {
  textAlign: "center",
  marginTop: "40px",
  color: "#64748b",
};

/* ========== COMPONENTS ========== */

const InsightCard = ({ title, value, accent }) => (
  <div style={card}>
    <div style={{ ...accentBar, background: accent }} />
    <p style={cardLabel}>{title}</p>
    <h2>₹ {value.toLocaleString()}</h2>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div style={chartCard}>
    <h3 style={{ marginBottom: "14px" }}>{title}</h3>
    <div style={chartBox}>{children}</div>
  </div>
);

const card = {
  position: "relative",
  background: "#fff",
  padding: "22px",
  borderRadius: "18px",
  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
};

const accentBar = {
  position: "absolute",
  left: 0,
  top: 0,
  width: "6px",
  height: "100%",
  borderRadius: "6px 0 0 6px",
};

const cardLabel = {
  color: "#64748b",
  marginBottom: "6px",
};

const chartCard = {
  background: "#fff",
  padding: "24px",
  borderRadius: "18px",
  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
};

const chartBox = {
  height: "260px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};
