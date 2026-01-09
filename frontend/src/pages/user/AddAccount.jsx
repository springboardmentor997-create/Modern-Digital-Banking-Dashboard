/**
 * AddAccount Page
 *
 * Part of:
 * - Dashboard → Accounts module
 *
 * Responsibility:
 * - Allows user to add a new bank account
 * - Handles initial Transaction PIN creation
 *
 * Important Note:
 * - Transaction PIN is created here while adding the account
 * - PIN is created only once per user
 * - Same PIN is reused for all future transactions
 *
 * Connected Files:
 * - Accounts.jsx → Lists accounts added here
 * - SendMoney.jsx → Uses accounts added here
 * - EnterPinModal.jsx → Verifies this PIN during payments
 *
 * Flow:
 * Add Account → Create PIN → Save Account → Use PIN for payments
 */

import { useState } from "react";
import api from "@/services/api";

const AddAccount = ({ onClose, onSuccess }) => {
  const [bankName, setBankName] = useState("");
  const [showBanks, setShowBanks] = useState(false);
  const [accountType, setAccountType] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🔐 PIN flow states
  const [step, setStep] = useState(1); // 1=form, 2=create pin, 3=confirm pin
  const [pin, setPin] = useState(["", "", "", ""]);
  const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
  const [pinError, setPinError] = useState("");

  const banks = [
    "State Bank of India",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
  ];

  const isAccountValid = /^\d{9,18}$/.test(accountNumber);

  const filteredBanks = banks.filter((bank) =>
    bank.toLowerCase().includes(bankName.toLowerCase())
  );

  // STEP 1 → Validate form and go to PIN
  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!bankName || !accountType || !accountNumber) {
      setError("All fields are required");
      return;
    }

    if (!isAccountValid) {
      setError("Account number is invalid");
      return;
    }

    if (!consent) {
      setError("Consent is required");
      return;
    }

    setStep(2);
  };

  // FINAL STEP → Create account with PIN
  const handleFinalSubmit = async () => {
    if (pin.join("") !== confirmPin.join("")) {
      setPinError("PIN does not match");
      return;
    }

    setPinError("");
    setLoading(true);

    try {
      await api.post("/accounts", {
        bank_name: bankName,
        account_type: accountType,
        account_number: accountNumber,
        pin: pin.join(""),
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to add account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        {/* STEP 1 : ADD ACCOUNT FORM */}
        {step === 1 && (
          <>
            <h2>Add Bank Account</h2>

            <form onSubmit={handleSubmit}>
              {/* Bank Search + Select */}
              <div style={{ position: "relative" }}>
                <input
                  style={input}
                  placeholder="Search or select bank"
                  value={bankName}
                  onChange={(e) => {
                    setBankName(e.target.value);
                    setShowBanks(true);
                  }}
                  onFocus={() => setShowBanks(true)}
                />

                {showBanks && (
                  <div style={dropdown}>
                    {filteredBanks.length > 0 ? (
                      filteredBanks.map((bank) => (
                        <div
                          key={bank}
                          style={dropdownItem}
                          onClick={() => {
                            setBankName(bank);
                            setShowBanks(false);
                          }}
                        >
                          {bank}
                        </div>
                      ))
                    ) : (
                      <div style={noResult}>Bank not found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Account Type */}
              <select
                style={input}
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
              >
                <option value="">Select Account Type</option>
                <option value="savings">Savings</option>
                <option value="current">Current</option>
                <option value="credit">Credit</option>
              </select>

              {/* Account Number */}
              <input
                style={{
                  ...input,
                  borderColor:
                    accountNumber && !isAccountValid ? "#dc2626" : "#d1d5db",
                }}
                placeholder="Account Number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />

              {accountNumber && !isAccountValid && (
                <p style={{ color: "#dc2626", fontSize: "12px" }}>
                  Account number is invalid
                </p>
              )}

              {/* Consent */}
              <label style={consentRow}>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />
                I authorize secure account fetching
              </label>

              {error && <p style={{ color: "red" }}>{error}</p>}

              <div style={btnRow}>
                <button type="button" onClick={onClose} style={cancelBtn}>
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    ...submitBtn,
                    opacity:
                      bankName && accountType && isAccountValid && consent
                        ? 1
                        : 0.5,
                  }}
                  disabled={
                    !bankName ||
                    !accountType ||
                    !isAccountValid ||
                    !consent
                  }
                >
                  Add Account
                </button>
              </div>
            </form>
          </>
        )}

        {/* STEP 2 : CREATE PIN */}
        {step === 2 && (
          <PinScreen
            title="Create PIN"
            pin={pin}
            setPin={setPin}
            onNext={() => setStep(3)}
          />
        )}

        {/* STEP 3 : CONFIRM PIN */}
        {step === 3 && (
          <PinScreen
            title="Confirm PIN"
            pin={confirmPin}
            setPin={setConfirmPin}
            onNext={handleFinalSubmit}
            loading={loading}
            error={pinError}
            showBack
            onBack={() => {
              setConfirmPin(["", "", "", ""]);
              setPinError("");
              setStep(2);
            }}
            clearError={() => setPinError("")}   // ⭐ FIX
          />
        )}
      </div>
    </div>
  );
};

export default AddAccount;

/* ---------- PIN COMPONENT ---------- */

const PinScreen = ({
  title,
  pin,
  setPin,
  onNext,
  loading,
  error,
  showBack,
  onBack,
  clearError,
}) => {
  const handleChange = (val, index) => {
    if (!/^\d?$/.test(val)) return;

    const updated = [...pin];
    updated[index] = val;
    setPin(updated);

    // ⭐ FIX: clear error when user retypes
    if (error && clearError) {
      clearError();
    }

    if (val && index < 3) {
      document.getElementById(`pin-${index + 1}`).focus();
    }
  };

  return (
    <>
      <h3 style={{ textAlign: "center", marginBottom: "18px" }}>{title}</h3>

      <div style={pinRow}>
        {pin.map((v, i) => (
          <input
            key={i}
            id={`pin-${i}`}
            type="password"
            inputMode="numeric"
            maxLength="1"
            value={v}
            onChange={(e) => handleChange(e.target.value, i)}
            style={pinBox}
          />
        ))}
      </div>

      {error && (
        <p style={{ color: "#dc2626", fontSize: "13px", textAlign: "center" }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", justifyContent: "center" }}>
        <button
          style={{
            ...submitBtn,
            marginTop: "24px",
            width: "140px",
            opacity: pin.join("").length === 4 ? 1 : 0.5,
          }}
          disabled={pin.join("").length !== 4 || loading}
          onClick={onNext}
        >
          {loading ? "Processing..." : "Continue"}
        </button>
      </div>

      {showBack && (
        <p
          style={{
            marginTop: "14px",
            textAlign: "center",
            fontSize: "13px",
            color: "#2563eb",
            cursor: "pointer",
          }}
          onClick={onBack}
        >
          Go back to Create PIN
        </p>
      )}
    </>
  );
};

/* ---------- STYLES ---------- */

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
  background: "#ffffff",
  padding: "28px",
  borderRadius: "16px",
  width: "420px",
  maxWidth: "90%",
};

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "14px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
};

const dropdown = {
  position: "absolute",
  top: "52px",
  left: 0,
  right: 0,
  background: "#fff",
  border: "1px solid #d1d5db",
  borderRadius: "10px",
  maxHeight: "180px",
  overflowY: "auto",
  zIndex: 10,
};

const dropdownItem = {
  padding: "10px 12px",
  cursor: "pointer",
};

const noResult = {
  padding: "10px 12px",
  color: "#64748b",
  fontSize: "13px",
};

const consentRow = {
  display: "flex",
  gap: "10px",
  alignItems: "flex-start",
  fontSize: "13px",
  marginBottom: "16px",
};

const btnRow = {
  display: "flex",
  gap: "12px",
};

const cancelBtn = {
  flex: 1,
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "#e5e7eb",
};

const submitBtn = {
  flex: 1,
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: "600",
};

const pinRow = {
  display: "flex",
  justifyContent: "center",
  gap: "12px",
};

const pinBox = {
  width: "48px",
  height: "48px",
  textAlign: "center",
  fontSize: "20px",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
};
