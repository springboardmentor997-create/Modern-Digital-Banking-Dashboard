/**
 * Page: BillProcessing
 *
 * Purpose:
 * - Used ONLY for Bills
 * - Calls backend bills API
 * - Shows processing UI
 * - Does NOT affect send money
 */

import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "@/services/api";

const BillProcessing = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  useEffect(() => {
    if (!state) {
      navigate("/dashboard");
      return;
    }

    const processBill = async () => {
      try {
        await api.post("/bills/pay", {
          to: state.to,
          amount: state.amount,
          mode: state.mode,
          purpose: state.purpose,
          provider: state.provider,
          operator: state.operator,
          plan: state.plan,
        });

        navigate("/dashboard/payment-success", { state });
      } catch (err) {
        console.error("Bill payment failed", err);
        navigate("/dashboard/payment-failed", { state });
      }
    };

    processBill();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white px-8 py-6 rounded-xl shadow-lg text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium">Processing bill payment…</p>
        <p className="text-sm text-gray-500 mt-1">
          Please wait, do not refresh
        </p>
      </div>
    </div>
  );
};

export default BillProcessing;
