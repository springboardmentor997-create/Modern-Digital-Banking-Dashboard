/**
 * QuickActions (User Dashboard)
 *
 * Styled to match Admin Dashboard
 * - Same color language
 * - Same icon treatment
 * - Focused actions (4 cards)
 */

import { Send, FileText, ArrowLeftRight, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Send Money",
      desc: "Transfer funds instantly",
      icon: Send,
      path: "/dashboard/transfers",
      bg: "linear-gradient(135deg, #2563eb, #1d4ed8)", // Blue
    },
    {
      label: "Add Account",
      desc: "Link a new bank account",
      icon: CreditCard,
      path: "/dashboard/accounts",
      bg: "linear-gradient(135deg, #16a34a, #15803d)", // Green
    },
    {
      label: "Pay Bills",
      desc: "Recharge & bill payments",
      icon: FileText,
      path: "/dashboard/bills",
      bg: "linear-gradient(135deg, #f59e0b, #ea580c)", // Orange
    },
    {
      label: "Transactions",
      desc: "View transaction history",
      icon: ArrowLeftRight,
      path: "/dashboard/transactions",
      bg: "linear-gradient(135deg, #64748b, #475569)", // Slate
    },
  ];

  return (
    <div style={{ marginBottom: 40 }}>
      <h3 style={{ marginBottom: 16 }}>Quick Actions</h3>

      <div style={grid}>
        {actions.map((a) => (
          <div
            key={a.label}
            onClick={() => navigate(a.path)}
            style={{ ...card, background: a.bg }}
          >
            <div style={iconWrap}>
              <a.icon size={22} />
            </div>

            <div>
              <div style={label}>{a.label}</div>
              <div style={desc}>{a.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;

/* ===== styles ===== */

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: 20,
};

const card = {
  display: "flex",
  alignItems: "center",
  gap: 16,
  padding: 20,
  borderRadius: 18,
  color: "#fff",
  cursor: "pointer",
  boxShadow: "0 14px 32px rgba(0,0,0,0.18)",
};

const iconWrap = {
  width: 42,
  height: 42,
  borderRadius: "50%",
  background: "rgba(255,255,255,0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const label = {
  fontWeight: 600,
  fontSize: 16,
};

const desc = {
  fontSize: 13,
  opacity: 0.9,
};
