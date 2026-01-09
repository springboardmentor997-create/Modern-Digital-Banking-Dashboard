/**
 * UPI / Mobile number transfer page
 *
 * Part of:
 * - Payments flow (opened from SendMoney.jsx)
 * - Route: /dashboard/transfers/upi
 *
 * Connected Files:
 * - Uses: EnterPinModal.jsx
 * - Navigates to: PaymentSuccess.jsx, PaymentFailed.jsx
 *
 * Purpose:
 * Allows sending money using UPI ID or mobile number.
 * Performs validation, opens PIN modal, and handles result.
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/services/api";
import EnterPinModal from "@/components/user/payments/EnterPinModal";
import PaymentProcessing from "@/components/user/payments/PaymentProcessing";
import { useBudgets } from "@/context/BudgetContext";
import BudgetWarning from "@/components/user/budgets/BudgetWarning";

const SendToUpi = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // 👈 from SendMoney
  const fromAccountId = state?.fromAccountId;

  const [upi, setUpi] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [upiError, setUpiError] = useState("");

  const { checkBudget, applyPaymentToBudget } = useBudgets();
  const [budgetAlert, setBudgetAlert] = useState(null);


    // ✅ HARD BLOCK if account is missing
  useEffect(() => {
    if (!fromAccountId) {
      alert("Please create an account first");
      navigate("/dashboard/accounts");
    }
  }, [fromAccountId, navigate]);

  // 🚫 Prevent rendering page if account not present
  if (!fromAccountId) return null;

  // ✅ Budget check handler (already in your code)
  const handleSend = () => {
    const result = checkBudget("Food", Number(amount));

    if (result.status === "exceeded") {
      setBudgetAlert(result);
      return;
    }

    setShowPin(true);
  };

  // ✅ Validation (UNCHANGED)
  useEffect(() => {
    let validUpi = false;

    if (!upi) {
      setUpiError("");
      setIsValid(false);
      return;
    }

    if (/^\d+$/.test(upi)) {
      validUpi = /^[6-9]\d{9}$/.test(upi);
      setUpiError(validUpi ? "" : "Enter a valid mobile number");
    } else {
      validUpi = /^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upi);
      setUpiError(validUpi ? "" : "Enter a valid UPI ID");
    }

    setIsValid(validUpi && Number(amount) > 0);
  }, [upi, amount]);

  // ✅ SINGLE confirmPayment (real one)
  const confirmPayment = async (pin) => {
    setShowPin(false);
    setProcessing(true);

    const receipt = {
      to: upi,
      amount,
      mode: "UPI",
      note,
      time: new Date().toLocaleString(),
    };

    try {
      await api.post("/transfers", {
        from_account_id: fromAccountId,
        amount: Number(amount),
        pin,
        transfer_type: "upi",
        upi_id: upi,
      });

      applyPaymentToBudget("Food", Number(amount));

      navigate("/dashboard/payment-success", { state: receipt });
    } catch (err) {
      navigate("/dashboard/payment-failed", {
        state: {
          ...receipt,
          reason: err.response?.data?.detail || "Transaction failed",
        },
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Send to Mobile / UPI</h2>

        <input
          className="w-full border p-3 rounded-lg mb-1"
          placeholder="UPI ID or Mobile Number"
          value={upi}
          onChange={(e) => setUpi(e.target.value)}
        />
        {upiError && <p className="text-sm text-red-600 mb-2">{upiError}</p>}

        <input
          type="number"
          className="w-full border p-3 rounded-lg mb-3"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <input
          className="w-full border p-3 rounded-lg mb-4"
          placeholder="Note (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />

        {/* ⚠️ Budget warning (already imported, now usable) */}
        {budgetAlert && (
          <BudgetWarning
            data={budgetAlert}
            onCancel={() => setBudgetAlert(null)}
            onContinue={() => {
              setBudgetAlert(null);
              setShowPin(true);
            }}
          />
        )}

        {/* 🔴 ONLY CHANGE: use handleSend */}
        <button
          disabled={!isValid}
          onClick={handleSend}
          className={`w-full py-3 rounded-lg font-medium ${
            isValid
              ? "bg-indigo-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Send Money
        </button>
      </div>

      <EnterPinModal
        open={showPin}
        onClose={() => setShowPin(false)}
        onConfirm={confirmPayment}
      />

      <PaymentProcessing open={processing} />
    </>
  );
};

export default SendToUpi;
