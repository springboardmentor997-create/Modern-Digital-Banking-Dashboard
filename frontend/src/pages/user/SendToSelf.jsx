/**
 * Self account transfer page
 *
 * Part of:
 * - Payments flow (opened from SendMoney.jsx)
 * - Route: /dashboard/transfers/self
 *
 * Connected Files:
 * - Uses: services/api.js (fetch accounts)
 * - Uses: EnterPinModal.jsx
 * - Navigates to: PaymentSuccess.jsx, PaymentFailed.jsx
 *
 * Purpose:
 * Transfers money between the user's own linked accounts
 * after validating amount and transaction PIN.
 */

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/services/api";
import EnterPinModal from "@/components/user/payments/EnterPinModal";
import PaymentProcessing from "@/components/user/payments/PaymentProcessing";
import { useBudgets } from "@/context/BudgetContext";
import BudgetWarning from "@/components/user/budgets/BudgetWarning";

const SendToSelf = () => {
  const navigate = useNavigate();
  const { state } = useLocation(); // 👈 from SendMoney
  const fromAccountId = state?.fromAccountId;

  const [accounts, setAccounts] = useState([]);
  const [toAccount, setToAccount] = useState("");
  const [amount, setAmount] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // 🔹 Budget logic (REQUIRED)
  const { checkBudget, applyPaymentToBudget } = useBudgets();
  const [budgetAlert, setBudgetAlert] = useState(null);

  useEffect(() => {
    api.get("/accounts").then((res) => {
      setAccounts(res.data || []);
    });
  }, []);

  useEffect(() => {
    setIsValid(Boolean(toAccount) && Number(amount) > 0);
  }, [toAccount, amount]);

  // 🔹 Budget check before PIN (REQUIRED)
  const handleSend = () => {
    const result = checkBudget("Self Transfer", Number(amount));

    if (result.status === "exceeded") {
      setBudgetAlert(result);
      return;
    }

    setShowPin(true);
  };

  const confirmTransfer = async (pin) => {
    setShowPin(false);
    setProcessing(true);

    const receipt = {
      to: "My Account",
      amount,
      mode: "Self Transfer",
      time: new Date().toLocaleString(),
    };

    try {
      await api.post("/transfers", {
        from_account_id: fromAccountId,
        to_account_id: Number(toAccount),
        amount: Number(amount),
        pin,
        transfer_type: "self",
      });

      // 🔹 Update budget after success (REQUIRED)
      applyPaymentToBudget("Self Transfer", Number(amount));

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
        <h2 className="text-xl font-semibold mb-4">
          Transfer Between My Accounts
        </h2>

        <select
          className="w-full border p-3 rounded-lg mb-3 bg-white"
          value={toAccount}
          onChange={(e) => setToAccount(e.target.value)}
        >
          <option value="" disabled>
            Select destination account
          </option>

          {accounts.map((acc) => (
            <option key={acc.id} value={acc.id}>
              {acc.bank_name} • {acc.account_type} • {acc.masked_account}
            </option>
          ))}
        </select>

        <input
          type="number"
          className="w-full border p-3 rounded-lg mb-4"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        {/* 🔹 Budget warning (NO UI CHANGE, JUST APPEARS IF NEEDED) */}
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

        {/* 🔴 ONLY CHANGE HERE: use handleSend */}
        <button
          disabled={!isValid}
          onClick={handleSend}
          className={`w-full py-3 rounded-lg font-medium ${
            isValid
              ? "bg-indigo-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Transfer
        </button>
      </div>

      <EnterPinModal
        open={showPin}
        onClose={() => setShowPin(false)}
        onConfirm={confirmTransfer}
      />

      <PaymentProcessing open={processing} />
    </>
  );
};

export default SendToSelf;
