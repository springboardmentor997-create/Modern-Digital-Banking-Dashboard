import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

/**
 * TransactionsList
 *
 * Purpose:
 * - Show recent transactions like real banking apps
 * - Debit = red, Credit = green
 * - Improved visual hierarchy
 * - Backend driven (no logic change)
 */

const TransactionsList = ({ data = [] }) => {
  return (
    <div style={card}>
      <h3 style={title}>Recent Transactions</h3>

      {data.length === 0 ? (
        <p style={muted}>No recent transactions</p>
      ) : (
        data.map((txn) => {
          const isDebit = txn.txn_type === "debit";

          return (
            <div key={txn.id} style={row}>
              {/* LEFT */}
              <div style={left}>
                <div
                  style={{
                    ...iconWrap,
                    background: isDebit ? "#fee2e2" : "#dcfce7",
                    color: isDebit ? "#dc2626" : "#16a34a",
                  }}
                >
                  {isDebit ? (
                    <ArrowUpRight size={18} />
                  ) : (
                    <ArrowDownLeft size={18} />
                  )}
                </div>

                <div>
                  <div style={desc}>{txn.description}</div>
                  <div style={meta}>
                    {txn.txn_date} • {txn.txn_type}
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div
                style={{
                  ...amount,
                  color: isDebit ? "#dc2626" : "#16a34a",
                }}
              >
                {isDebit ? "-" : "+"}₹{txn.amount}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TransactionsList;

/* ===== styles ===== */

const card = {
  background: "#ffffff",
  padding: 24,
  borderRadius: 18,
  boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
  marginBottom: 36,
};

const title = {
  marginBottom: 16,
  fontSize: 18,
  fontWeight: 600,
};

const row = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "14px 0",
  borderBottom: "1px solid #e5e7eb",
};

const left = {
  display: "flex",
  alignItems: "center",
  gap: 14,
};

const iconWrap = {
  width: 38,
  height: 38,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const desc = {
  fontWeight: 600,
  fontSize: 15,
};

const meta = {
  fontSize: 13,
  color: "#64748b",
  marginTop: 2,
};

const amount = {
  fontWeight: 700,
  fontSize: 16,
};

const muted = {
  color: "#64748b",
};
