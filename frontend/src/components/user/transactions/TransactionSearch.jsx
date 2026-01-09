/**
 * Component: TransactionSearch
 *
 * Purpose:
 * - Provides search/filter input for transaction list
 *
 * Key Behavior:
 * - Filters transactions by keyword, date, or amount
 *
 * Connected Files:
 * - Used in: Transactions.jsx
 *
 * Note:
 * - Works on already fetched transaction data
 * - No direct API interaction
 */




const TransactionSearch = ({ value, onChange }) => {
  return (
    <div style={wrapper}>
      <input
        type="text"
        placeholder="Search by description or merchant"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={input}
      />
    </div>
  );
};

export default TransactionSearch;

/* ---------- STYLES ---------- */

const wrapper = {
  margin: "20px 0",
};

const input = {
  width: "100%",
  padding: "14px 16px",
  borderRadius: "12px",
  border: "1px solid #e5e7eb",
  fontSize: "14px",
  outline: "none",
};
