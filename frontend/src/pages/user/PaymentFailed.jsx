/**
 * Payment failed screen
 *
 * Part of:
 * - Payments result flow
 * - Route: /dashboard/payment-failed
 *
 * Opened from:
 * - SendToUpi.jsx
 * - SendToSelf.jsx
 * - SendToBank.jsx
 *
 * Purpose:
 * Displays failure details and allows retry,
 * receipt download, sharing, or returning home.
 */




import { useLocation, useNavigate } from "react-router-dom";
import { Download, Share2 } from "lucide-react";
import appLogo from "@/assets/logo.png";
import upiLogo from "@/assets/upi.png";

const PaymentFailed = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return null;

  const reason = state.reason || "Transaction failed";

  const receiptText = `
Payment Failed
--------------
To: ${state.to}
Amount: ₹${state.amount}
Mode: ${state.mode}
Reason: ${reason}
Time: ${state.time}
`;

  const downloadReceipt = () => {
    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payment-failed.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareReceipt = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Payment Failed",
        text: receiptText,
      });
    } else {
      alert("Sharing not supported on this device");
    }
  };

  return (
    <>
      {/* BACKGROUND BLUR */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" />

      {/* CARD */}
      <div className="fixed inset-0 z-50 flex justify-center items-center">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md text-center animate-shake">

          {/* ❌ FAIL ANIMATION */}
          <div className="flex justify-center mb-3">
            <svg className="w-14 h-14" viewBox="0 0 52 52">
              <circle
                cx="26"
                cy="26"
                r="25"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
              />
              <path
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
                d="M16 16 36 36 M36 16 16 36"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-red-600 mb-2">
            Payment Failed
          </h2>

          {/* LOGOS */}
          <div className="flex justify-center items-center gap-3 mb-3">
            <img src={appLogo} alt="App Logo" className="h-8" />
            <span className="text-gray-400 text-lg font-semibold">/</span>
            <img src={upiLogo} alt="UPI Logo" className="h-10" />
          </div>

          <p className="text-sm text-red-500 mb-4">
            Reason: {reason}
          </p>

          <div className="text-sm text-gray-700 space-y-2 mb-6">
            <p><strong>To:</strong> {state.to}</p>
            <p><strong>Amount:</strong> ₹{state.amount}</p>
            <p><strong>Mode:</strong> {state.mode}</p>
            <p><strong>Time:</strong> {state.time}</p>
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={downloadReceipt}
              className="flex-1 flex items-center justify-center gap-2 border py-3 rounded-lg"
            >
              <Download size={18} />
              Receipt
            </button>

            <button
              onClick={shareReceipt}
              className="flex-1 flex items-center justify-center gap-2 border py-3 rounded-lg"
            >
              <Share2 size={18} />
              Share
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 border py-3 rounded-lg"
            >
              Retry
            </button>

            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg"
            >
              Home
            </button>
          </div>
        </div>
      </div>

      {/* ❌ SHAKE ANIMATION CSS */}
      <style>
        {`
        @keyframes shake {
          0% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
          100% { transform: translateX(0); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
        `}
      </style>
    </>
  );
};

export default PaymentFailed;
