/**
 * Check Balance Page
 *
 * What:
 * - Shows accounts as cards
 * - Requires PIN to reveal balance
 * - Real banking UX
 *
 * Backend:
 * - GET /accounts
 */

import { useEffect, useState, useRef } from "react";
import api from "@/services/api";
import AddAccount from "./AddAccount";

const CheckBalance = () => {

  const [accounts, setAccounts] = useState([]);
  const [showPin, setShowPin] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [pin, setPin] = useState(["", "", "", ""]);
  const [verifiedAccountId, setVerifiedAccountId] = useState(null);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const pinRefs = useRef([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const res = await api.get("/accounts");
        setAccounts(res.data || []);
      } catch {
        setAccounts([]);
      }
    };
    fetchAccounts();
  }, []);

  const openPinModal = (account) => {
    setSelectedAccount(account);
    setPin(["", "", "", ""]);
    setError("");
    setShowPin(true);
  };

  const confirmPin = async () => {
    if (pin.join("").length !== 4) return;

    setVerifiedAccountId(selectedAccount.id);
    setShowPin(false);
  };

  return (
    <div style={{ padding: "24px 32px" }}>
      <h2 style={{ fontSize: "22px", marginBottom: "28px" }}>
        Check Balance
      </h2>

      {/* ================= NO ACCOUNTS ================= */}
      {accounts.length === 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: 80,
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: 22,
              padding: "72px",
              width: "100%",
              maxWidth: 820,
              boxShadow: "0 18px 40px rgba(0,0,0,0.08)",
              textAlign: "center",
            }}
          >
            <h3 style={{ fontSize: 22, fontWeight: 700 }}>
              Get Started with Your First Account
            </h3>

            <p style={{ color: "#64748b", margin: "12px 0 28px" }}>
              Add a bank account to view balances securely.
            </p>

            <button
              onClick={() => setShowAdd(true)}
              style={{
                width: "100%",
                background: "#2563eb",
                color: "#fff",
                border: "none",
                padding: "14px",
                borderRadius: 12,
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
              }}
            >
              + Add Account
            </button>
          </div>
        </div>
      )}

      {/* ================= ACCOUNT CARDS ================= */}
      {accounts.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
            gap: "22px",
          }}
        >
          {accounts.map((acc) => (
            <div
              key={acc.id}
              style={{
                background: "#ffffff",
                padding: "26px",
                borderRadius: "18px",
                boxShadow: "0 12px 32px rgba(0,0,0,0.08)",
              }}
            >
              <h3 style={{ fontWeight: 700 }}>{acc.bank_name}</h3>
              <p style={{ color: "#64748b", marginBottom: 18 }}>
                •••• {acc.masked_account.slice(-4)}
              </p>

              {verifiedAccountId === acc.id ? (
                <>
                  <p style={{ color: "#64748b", fontSize: 13 }}>
                    Available Balance
                  </p>
                  <h1 style={{ marginTop: 4 }}>
                    ₹{acc.balance}
                  </h1>
                </>
              ) : (
                <button
                  onClick={() => openPinModal(acc)}
                  style={{
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    padding: "10px 22px",
                    borderRadius: "24px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  🔒 Check Balance
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ================= PIN MODAL ================= */}
      {showPin && (
        <div style={overlay}>
          <div style={modal}>
            <h3 style={{ textAlign: "center", marginBottom: 18 }}>
              Enter PIN
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

            {error && (
              <p style={{ color: "#dc2626", textAlign: "center" }}>
                {error}
              </p>
            )}

            <div style={btnRow}>
              <button
                style={cancelBtn}
                onClick={() => setShowPin(false)}
              >
                Cancel
              </button>
              <button
                style={submitBtn}
                disabled={pin.join("").length !== 4}
                onClick={confirmPin}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ================= ADD ACCOUNT MODAL ================= */}
      {showAdd && (
        <AddAccount
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default CheckBalance;

/* ================= STYLES ================= */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modal = {
  background: "#fff",
  padding: 28,
  borderRadius: 18,
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
