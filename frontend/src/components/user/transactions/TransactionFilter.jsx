/**
 * Component: TransactionFilter
 *
 * Purpose:
 * - Provides filtering options for transaction history
 * - Helps users narrow down transactions by type, date, or status
 *
 * Key Behavior:
 * - Accepts filter values from user input (dropdowns / buttons)
 * - Passes selected filters back to parent component
 *
 * Connected Files:
 * - Used in: Transactions.jsx
 * - Works together with:
 *   - TransactionRow.jsx
 *   - TransactionSearch.jsx
 *
 * Note:
 * - This component does NOT fetch data
 * - It only filters already loaded transactions on the frontend
 */



const TransactionFilter = ({
  accounts = [],
  filters,
  onChange,
}) => {
  return (
    <div style={wrapper}>
      {/* ACCOUNT FILTER */}
      <select
        style={input}
        value={filters.account_id || ""}
        onChange={(e) =>
          onChange({ ...filters, account_id: e.target.value })
        }
      >
        <option value="">All Accounts</option>
        {accounts.map((acc) => (
          <option key={acc.id} value={acc.id}>
            {acc.bank_name} ({acc.account_type})
          </option>
        ))}
      </select>

      {/* TYPE FILTER */}
      <select
        style={input}
        value={filters.txn_type || ""}
        onChange={(e) =>
          onChange({ ...filters, txn_type: e.target.value })
        }
      >
        <option value="">All Types</option>
        <option value="debit">Debit</option>
        <option value="credit">Credit</option>
      </select>

      {/* FROM DATE */}
      <input
        type="date"
        style={input}
        value={filters.from || ""}
        onChange={(e) =>
          onChange({ ...filters, from: e.target.value })
        }
      />

      {/* TO DATE */}
      <input
        type="date"
        style={input}
        value={filters.to || ""}
        onChange={(e) =>
          onChange({ ...filters, to: e.target.value })
        }
      />
    </div>
  );
};

export default TransactionFilter;

/* ---------- STYLES ---------- */

const wrapper = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "12px",
  marginBottom: "20px",
};

const input = {
  padding: "10px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
};
