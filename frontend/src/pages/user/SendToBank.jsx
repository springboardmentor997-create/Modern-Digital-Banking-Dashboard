/**
 * Bank account transfer page
 *
 * Part of:
 * - Payments flow (opened from SendMoney.jsx)
 * - Route: /dashboard/transfers/bank
 *
 * Connected Files:
 * - Uses: EnterPinModal.jsx
 * - Navigates to: PaymentSuccess.jsx, PaymentFailed.jsx
 *
 * Purpose:
 * Sends money to an external bank account with
 * account number, IFSC validation, and PIN verification.
 */

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/services/api";
import EnterPinModal from "@/components/user/payments/EnterPinModal";
import PaymentProcessing from "@/components/user/payments/PaymentProcessing";
import { useBudgets } from "@/context/BudgetContext";
import BudgetWarning from "@/components/user/budgets/BudgetWarning";

const SendToBank = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // 👈 from SendMoney
  const fromAccountId = state?.fromAccountId;

  const [accountNo, setAccountNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [amount, setAmount] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [accountError, setAccountError] = useState("");
  const [ifscError, setIfscError] = useState("");

  // 🔹 Budget logic (REQUIRED)
  const { checkBudget, applyPaymentToBudget } = useBudgets();
  const [budgetAlert, setBudgetAlert] = useState(null);

  useEffect(() => {
    const validAccount = /^\d{9,18}$/.test(accountNo);
    const validIfsc = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc.toUpperCase());
    const validAmount = Number(amount) > 0;

    setAccountError(
      accountNo && !validAccount ? "Enter a valid account number" : ""
    );
    setIfscError(ifsc && !validIfsc ? "Enter a valid IFSC code" : "");
    setIsValid(validAccount && validIfsc && validAmount);
  }, [accountNo, ifsc, amount]);

  // 🔹 Budget check before PIN (REQUIRED)
  const handleSend = () => {
    const result = checkBudget("Bank Transfer", Number(amount));

    if (result.status === "exceeded") {
      setBudgetAlert(result);
      return;
    }

    setShowPin(true);
  };

  const confirmPayment = async (pin) => {
    setShowPin(false);
    setProcessing(true);

    const receipt = {
      to: accountNo,
      amount,
      mode: "Bank Transfer",
      time: new Date().toLocaleString(),
    };

    try {
      await api.post("/transfers", {
        from_account_id: fromAccountId,
        amount: Number(amount),
        pin,
        transfer_type: "bank",
        to_account_number: accountNo,
      });

      // 🔹 Update budget after success (REQUIRED)
      applyPaymentToBudget("Bank Transfer", Number(amount));

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
    <div className="flex justify-center pt-16">
      <div className="w-full max-w-lg bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Send to Bank Account</h2>

        <input
          className="w-full border p-3 rounded-lg mb-1"
          placeholder="Account Number"
          value={accountNo}
          onChange={(e) => setAccountNo(e.target.value)}
        />
        {accountError && (
          <p className="text-sm text-red-600 mb-2">{accountError}</p>
        )}

        <input
          className="w-full border p-3 rounded-lg mb-1"
          placeholder="IFSC Code"
          value={ifsc}
          onChange={(e) => setIfsc(e.target.value)}
        />
        {ifscError && (
          <p className="text-sm text-red-600 mb-2">{ifscError}</p>
        )}

        <input
          type="number"
          className="w-full border p-3 rounded-lg mb-4"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {/* 🔹 Budget warning (appears only if exceeded) */}
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

        {/* 🔴 ONLY CHANGE HERE */}
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
    </div>
  );
};

export default SendToBank;
