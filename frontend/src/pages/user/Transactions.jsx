/**
 * Transactions history page
 *
 * Part of:
 * - Dashboard
 * - Route: /dashboard/transactions
 *
 * Connected Files:
 * - Uses: services/api.js (transactions)
 *
 * Purpose:
 * Displays list of past transactions
 * including credits, debits, and transfers.
 */

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import AddTransactionModal from "@/components/user/transactions/AddTransactionalModal";
import api from "@/services/api";

import TransactionSearch from "@/components/user/transactions/TransactionSearch";
import TransactionFilter from "@/components/user/transactions/TransactionFilter";
import TransactionRow from "@/components/user/transactions/TransactionRow";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    account_id: "",
    txn_type: "",
    from: "",
    to: "",
  });

  const fetchAccounts = async () => {
    const res = await api.get("/accounts");
    setAccounts(res.data);
  };

  const fetchTransactions = async () => {
    const res = await api.get("/transactions");
    setTransactions(res.data);
  };

  /* ================= IMPORT / EXPORT ================= */

  const handleExport = async () => {
    try {
      const res = await api.get("/transactions/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "transactions.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to export transactions");
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/transactions/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchTransactions();
      alert("Transactions imported successfully");
    } catch (err) {
      alert("Failed to import transactions");
    }
  };

  /* =================================================== */

  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchAccounts(), fetchTransactions()]);
      } catch (err) {
        console.error("Transaction load error:", err);
        if (err.response?.status === 401) {
          alert("Session expired. Please login again.");
        } else {
          alert("Failed to load transactions");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    if (
      search &&
      !tx.description?.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    if (filters.account_id && tx.account_id !== Number(filters.account_id)) {
      return false;
    }

    if (filters.txn_type && tx.txn_type !== filters.txn_type) {
      return false;
    }

    if (filters.from && new Date(tx.txn_date) < new Date(filters.from)) {
      return false;
    }

    if (filters.to && new Date(tx.txn_date) > new Date(filters.to)) {
      return false;
    }

    return true;
  });

  if (loading) {
    return <p>Loading transactions...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      {/* HEADER + IMPORT / EXPORT */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "600" }}>
            Transactions
          </h1>
          <p style={{ color: "#64748b", marginBottom: "20px" }}>
            View and manage your transaction history
          </p>
        </div>
      <div style={{ display: "flex", gap: "10px" }}>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            border: "1px solid #2563eb",
            padding: "9px 16px",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: "500",
            background: "#ffffff",
            color: "#2563eb",
            boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
            cursor: "pointer",
          }}
        >
          + Add Transaction
        </button>

          <button
            onClick={handleExport}
            style={{
              background: "linear-gradient(135deg, #2563eb, #1e40af)",
              color: "#fff",
              padding: "9px 16px",
              borderRadius: "10px",
              fontSize: "14px",
              fontWeight: "500",
              boxShadow: "0 8px 18px rgba(37,99,235,0.35)",
            }}
          >
            Export
          </button>
        </div>
      </div>

      <TransactionSearch value={search} onChange={setSearch} />

      <TransactionFilter
        accounts={accounts}
        filters={filters}
        onChange={setFilters}
      />

      {filteredTransactions.length === 0 && (
        <p style={{ marginTop: "20px", color: "#64748b" }}>
          No transactions found
        </p>
      )}

            {filteredTransactions.map((tx) => (
        <TransactionRow key={tx.id} txn={tx} />
      ))}

      {/* 🔽 ADD TRANSACTION MODAL – ADD HERE */}
      {showAddModal &&
        createPortal(
          <AddTransactionModal
            onClose={() => setShowAddModal(false)}
            onAdd={(txn) => {
              setTransactions((prev) => [txn, ...prev]);
            }}
          />,
          document.getElementById("modal-root")
        )}
    </div>
  );
};
 

export default Transactions;
