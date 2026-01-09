import { useEffect, useState } from "react";
import {
  Layers,
  ArrowLeftRight,
  Calendar,
  FileText,
  Download,
  Upload,
  Search,
} from "lucide-react";
import api from "@/services/api";

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [search, setSearch] = useState("");


  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/transactions",{
        params: {
          category: category|| undefined,
          type: type|| undefined,
          date: dateFilter|| undefined,
        },
      });
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EXPORT ================= */
  const exportData = async () => {
    try {
      const res = await api.get("/admin/transactions/export");
      const blob = new Blob([res.data.content], {
        type: "text/csv",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.data.filename;
      a.click();
    } catch (err) {
      alert("Export failed");
    }
  };


  /* ================= IMPORT ================= */
  const importCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    try {
      await api.post("/admin/transactions/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      fetchTransactions(); // refresh table
    } catch (err) {
      alert("Import failed");
    }
  };
  const filteredTransactions = transactions.filter((tx) => {
  const matchesSearch =
    tx.user_name?.toLowerCase().includes(search.toLowerCase()) ||
    tx.email?.toLowerCase().includes(search.toLowerCase());

  const matchesCategory = category ? tx.category === category : true;
  const matchesType = type ? tx.txn_type === type : true;
  const matchesDate = dateFilter ? tx.txn_date === dateFilter : true;

  return matchesSearch && matchesCategory && matchesType && matchesDate;
});




  return (
    <div>
      <div style={{ marginTop: "24px" }}>
        <div style={headerRow}>
          <div>
            <h1 style={title}>Transactions</h1>
            <p style={subtitle}>
              View and monitor all user transactions
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <label style={secondaryBtn}>
              <Upload size={16} /> Import CSV
              <input hidden type="file" accept=".csv" onChange={importCSV} />
            </label>

            <button style={primaryBtn} onClick={exportData}>
              <Download size={16} /> Export
            </button>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div style={filters}>
        <div style={selectWrap}>
          <Layers size={16} style={inputIcon} />
          <select 
            style={filterSelect}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="food">Food & Dining</option>
            <option value="shopping">Shopping</option>
            <option value="bills">Bills & Utilities</option>
            <option value="transfers">Transfers</option>
          </select>
        </div>

        <div style={selectWrap}>
          <ArrowLeftRight size={16} style={inputIcon} />
          <select style={filterSelect}
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="debit">Debit</option>
            <option value="credit">Credit</option>
            <option value="upi">UPI</option>
            <option value="bank">Bank Transfer</option>
          </select>
        </div>

        <div style={selectWrap}>
          <Search size={16} style={inputIcon} />
          <input
            type="text"
            placeholder="Search user or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "10px 14px 10px 36px",
              borderRadius: "10px",
              border: "1.5px solid #CBD5E1",
              background: "#FFFFFF",
              outline: "none",
              width: "450px",
            }}
          />
        </div>

        <div style={dateWrap}>
          <Calendar size={16} style={inputIcon} />
          <input type="date" style={date} 
          onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <button 
          style={applyBtn}>
              Apply
            </button>
      </div>

      {/* TABLE */}
      <div style={card}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={thead}>
            <tr>
              <th style={th}>User</th>
              <th style={th}>Email</th>
              <th style={th}>Type</th>
              <th style={th}>Amount</th>
              <th style={th}>Status</th>
              <th style={th}>Date</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                 <td colSpan="6" style={{ textAlign: "center", padding: "40px" }}>
                  Loading transactions…
                  </td>
                  </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="6">
                  <div style={emptyState}>
                    <FileText size={32} />
                    <div>No transactions recorded</div>
                    <small>User activity will appear once transactions occur</small>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => (
                <tr key={tx.id} style={row}>
                  <td style={td}>{tx.user_name}</td>
                  <td style={td}>{tx.email}</td>
                  <td style={td}>{tx.txn_type}</td>
                  <td style={td}>₹{tx.amount}</td>
                  <td style={td}><StatusBadge status="SUCCESS" /></td>
                  <td style={td}>{tx.txn_date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTransactions;

/* ---------- COMPONENTS ---------- */

const StatusBadge = ({ status }) => {
  const colors = {
    SUCCESS: "#22c55e",
    FAILED: "#ef4444",
    PENDING: "#facc15",
  };

  return (
    <span style={{
      padding: "6px 12px",
      borderRadius: "999px",
      fontSize: "12px",
      fontWeight: 600,
      color: "#fff",
      background: colors[status] || "#64748b",
    }}>
      {status}
    </span>
  );
};

/* ---------- STYLES ---------- */

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const title = { fontSize: "28px", marginBottom: "6px" };
const subtitle = { color: "#64748b" };

const primaryBtn = {
  display: "flex",
  gap: "6px",
  alignItems: "center",
  background: "#1E40AF",
  color: "#fff",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryBtn = {
  display: "flex",
  gap: "6px",
  alignItems: "center",
  background: "#F0F7FF",
  color: "#1E40AF",
  padding: "10px 14px",
  borderRadius: "10px",
  cursor: "pointer",
  fontWeight: 600,
  border: "1.5px solid #93C5FD", // 🔥 clearly visible blue
};

const applyBtn = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  background: "#0f172a",
  color: "#ffffff",
  padding: "10px 16px",
  borderRadius: "10px",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  marginLeft: "auto",
};


const filters = {
  display: "flex",
  gap: "10px",
  background: "#FFFFFF",
  padding: "16px",
  borderRadius: "14px",
  border: "1.5px solid #CBD5E1",
  boxShadow: "0 12px 24px rgba(15,23,42,0.06)",
  backgroundClip: "padding-box", // ✅ FIXES THE LINE
  marginBottom: "20px",
};


const selectWrap = { position: "relative" };
const dateWrap = { position: "relative" };

const inputIcon = {
  position: "absolute",
  left: "10px",
  top: "50%",
  transform: "translateY(-50%)",
  color: "#64748b",
};

/* 🔥 FIXED HERE */
const filterSelect = {
  padding: "10px 36px 10px 36px",
  borderRadius: "10px",
  border: "1px solid #cbd5f5",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
  backgroundColor: "#FFFFFF",
  backgroundImage:
    "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E\")",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  backgroundSize: "16px",
};


const date = {
  padding: "10px 14px 10px 36px",
  borderRadius: "10px",
  border: "1.5px solid #CBD5E1",
  background: "#FFFFFF",
  outline: "none",
};

const card = {
  background: "#FFFFFF",
  borderRadius: "18px",
  border: "1px solid #D6E0F0",
  boxShadow: "0 30px 60px rgba(15, 23, 42, 0.12)",
  overflow: "hidden",
};

const thead = {
  background: "#F1F6FD",
  boxShadow: "inset 0 -1px 0 #CBD5E1",
};

const th = {
  padding: "16px",
  fontSize: "14px",
  textAlign: "left",
  color: "#475569",
};

const td = {
  padding: "16px",
  fontSize: "14px",
  color: "#0f172a",
};

const row = {
  borderBottom: "1px solid #E2E8F0",
};

const emptyState = {
  padding: "56px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "10px",
  color: "#475569",
  background: "#F8FAFF",
};