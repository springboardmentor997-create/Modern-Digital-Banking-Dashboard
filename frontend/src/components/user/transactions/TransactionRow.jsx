import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

const TransactionRow = ({ txn }) => {
  if (!txn) return null;

  const isCredit = txn.txn_type === "credit";

  return (
    <div style={row}>
      {/* LEFT SECTION */}
      <div style={leftWrap}>
        {/* ICON */}
        <div
          style={{
            ...iconWrap,
            background: isCredit ? "#dcfce7" : "#fee2e2",
            color: isCredit ? "#16a34a" : "#dc2626",
          }}
        >
          {isCredit ? (
            <ArrowDownLeft size={18} />
          ) : (
            <ArrowUpRight size={18} />
          )}
        </div>

        {/* TEXT */}
        <div>
          <p style={description}>{txn.description}</p>
          <p style={meta}>
            {new Date(txn.txn_date).toLocaleDateString()} • {txn.txn_type}
          </p>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div style={{ textAlign: "right" }}>
        <p
          style={{
            ...amount,
            color: isCredit ? "#16a34a" : "#dc2626",
          }}
        >
          {isCredit ? "+" : "-"} ₹{Number(txn.amount).toLocaleString()}
        </p>

        <p style={category}>{txn.category || "Payments"}</p>
      </div>
    </div>
  );
};

export default TransactionRow;

/* ---------- STYLES ---------- */

const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 20px",
  borderRadius: "16px",
  background: "#ffffff",
  boxShadow: "0 12px 24px rgba(0,0,0,0.06)",
  marginBottom: "14px",
};

const leftWrap = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
};

const iconWrap = {
  width: "42px",
  height: "42px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const description = {
  fontSize: "15px",
  fontWeight: "600",
  color: "#0f172a",
};

const meta = {
  fontSize: "12px",
  color: "#64748b",
  marginTop: "4px",
};

const amount = {
  fontSize: "16px",
  fontWeight: "700",
};

const category = {
  fontSize: "12px",
  color: "#64748b",
  marginTop: "4px",
};
