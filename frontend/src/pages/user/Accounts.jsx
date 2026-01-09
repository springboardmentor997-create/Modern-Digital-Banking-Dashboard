/**
 * Accounts Page
 *
 * Handles:
 * - Listing bank accounts
 * - Empty state (no accounts)
 * - Add / Delete accounts
 */

import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/services/api";
import AddAccount from "./AddAccount";

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const navigate = useNavigate();
  const pinRefs = useRef([]);

  // 🔐 DELETE WITH PIN STATES
  const [showPinModal, setShowPinModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [deleteError, setDeleteError] = useState("");

  const location = useLocation();
  const selectedId = location.state?.accountId;

  const visibleAccounts = selectedId
    ? accounts.filter(a => a.id === selectedId)
    : accounts;


  const fetchAccounts = async () => {
    try {
      const res = await api.get("/accounts");
      setAccounts(res.data || []);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const openCheckBalance = (accountId) => {
    navigate("/dashboard/balance",{
      state: { accountId },
    });
  };

  const openChangePin = (accountId) => {
    console.log("Change PIN:", accountId);
  };

  const handleDeleteClick = (id) => {
    setSelectedAccountId(id);
    setShowPinModal(true);
    setPin(["", "", "", ""]);
    setDeleteError("");
  };

  const handleConfirmDelete = async () => {
    try {
      await api.delete(`/accounts/${selectedAccountId}`, {
        data: { pin: pin.join("") },
      });
      setShowPinModal(false);
      fetchAccounts();
    } catch {
      setDeleteError("Invalid PIN");
    }
  };

  if (loading) return <p>Loading accounts...</p>;

  return (
    <div style={page}>
      {/* HEADER */}
      <div style={header}>
        <h1 style={title}>Accounts</h1>

        <div style={headerRight}>
          <button style={addBtn} onClick={() => setShowAdd(true)}>
            + Add Account
          </button>
        </div>
      </div>

      {/* EMPTY STATE */}
      {accounts.length === 0 && (
        <div style={emptyWrap}>
          <div style={emptyCard}>
            <div style={emptyContent}>
            <h3 style={emptyTitle}>
              Get Started with Your First Account
            </h3>
            <p style={emptyText}>
              Add a bank account to view balances, make transfers, pay bills, and manage your finances securely all in one place.
            </p>
            <button style={emptyBtn} onClick={() => setShowAdd(true)}>
              + Add Account
            </button>
            </div>
          </div>
        </div>
      )}

      {/* ACCOUNT LIST */}
      {accounts.map((acc) => (
        <div key={acc.id} style={card}>
          {/* LEFT */}
          <div>
            <div style={bankName}>{acc.bank_name}</div>
            <div style={subText}>{acc.masked_account}</div>
            <div style={accountType}>{acc.account_type.toUpperCase()}</div>
          </div>

          {/* RIGHT */}
          <div style={rightCol}>
            <div style={actionRow}>
              <button
                style={checkBalanceBtn}
                onClick={() => openCheckBalance(acc.id)}
              >
                Check Balance
              </button>

              <button
                style={changePinBtn}
                onClick={() => 
                  navigate("/dashboard/accounts/verify-identity", {
                    state: { accountId: acc.id },
                  })
                }
              >
                Change PIN
              </button>
            </div>

            <button
              style={deleteBtn}
              onClick={() => handleDeleteClick(acc.id)}
            >
              Remove Account
            </button>
          </div>
        </div>
      ))}

      {/* ADD ACCOUNT */}
      {showAdd && (
        <AddAccount
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false);
            fetchAccounts();
          }}
        />
      )}

      {/* DELETE PIN MODAL */}
      {showPinModal && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ textAlign: "center", marginBottom: 16 }}>
              Enter PIN to Delete
            </h3>

            <div style={pinRow}>
              {pin.map((v, i) => (
                <input
                  key={i}
                  ref={(el) => (pinRefs.current[i] = el)}
                  maxLength="1"
                  type="password"
                  value={v}
                  onChange={(e) => {
                    if (!/^\d?$/.test(e.target.value)) return;
                    const updated = [...pin];
                    updated[i] = e.target.value;
                    setPin(updated);

                    if (e.target.value && i < 3) {
                      pinRefs.current[i + 1]?.focus();
                    }
                  }}

                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !pin[i] && i > 0) {
                      pinRefs.current[i - 1]?.focus();
                    }
                  }}
                  style={pinBox}
                />
              ))}
            </div>

            {deleteError && (
              <p style={{ color: "#dc2626", textAlign: "center" }}>
                {deleteError}
              </p>
            )}

            <div style={btnRow}>
              <button
                style={cancelBtn}
                onClick={() => setShowPinModal(false)}
              >
                Cancel
              </button>
              <button
                style={submitBtn}
                disabled={pin.join("").length !== 4}
                onClick={handleConfirmDelete}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;

/* ================= STYLES ================= */

const page = {
  padding: "24px 32px",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 28,
};

const title = {
  fontSize: "26px",
  fontWeight: "700",
  color: "#0f172a",
};

const headerRight = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  paddingRight: "12px",
};

const addBtn = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "10px 18px",
  borderRadius: 10,
  fontWeight: 600,
};

const emptyWrap = {
  display: "flex",
  justifyContent: "center",
  marginTop: 60,
};


const emptyCard = {
  background: "#ffffff",
  borderRadius: 22,
  padding: "72px",
  width: "100%",
  maxWidth: 820,
  boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
};

const emptyText = {
  color: "#64748b",
  margin: "10px 0 24px",
  fontSize: 14,
};

const card = {
  background: "#fff",
  borderRadius: 16,
  padding: "18px 22px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
  boxShadow: "0 12px 28px rgba(0,0,0,0.08)",
};

const bankName = {
  fontSize: 16,
  fontWeight: 700,
};

const subText = {
  fontSize: 13,
  color: "#64748b",
  marginTop: 4,
};

const accountType = {
  fontSize: 12,
  color: "#475569",
};

const rightCol = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
};

const actionRow = {
  display: "flex",
  gap: 10,
  marginBottom: 8,
};

const checkBalanceBtn = {
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "7px 14px",
  borderRadius: 8,
  fontSize: 13,
};

const changePinBtn = {
  background: "#f1f5f9",
  border: "1px solid #cbd5f5",
  padding: "7px 14px",
  borderRadius: 8,
  fontSize: 13,
};

const deleteBtn = {
  background: "transparent",
  border: "none",
  color: "#dc2626",
  fontSize: 13,
  cursor: "pointer",
};

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "#fff",
  padding: 28,
  borderRadius: 16,
  width: 360,
};

const pinRow = {
  display: "flex",
  gap: 12,
  justifyContent: "center",
  marginBottom: 16,
};

const pinBox = {
  width: 48,
  height: 48,
  textAlign: "center",
  fontSize: 20,
  borderRadius: 10,
  border: "1px solid #d1d5db",
};

const btnRow = {
  display: "flex",
  gap: 12,
};

const cancelBtn = {
  flex: 1,
  padding: 12,
  borderRadius: 10,
  background: "#e5e7eb",
  border: "none",
};

const submitBtn = {
  flex: 1,
  padding: 12,
  borderRadius: 10,
  background: "#2563eb",
  color: "#fff",
  border: "none",
};


const emptyContent = {
  maxWidth: 560,
  margin: "0 auto",
  textAlign: "center",
};

const emptyBtn = {
  marginTop: 16,
  width: "100%",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  padding: "14px",
  borderRadius: 12,
  fontWeight: 600,
  fontSize: 15,
};

const emptyTitle = {
  fontSize: 24,
  fontWeight: 700,
  marginBottom: 10,
  color: "#0f172a",
};
