/**
 * Payment success screen
 *
 * Part of:
 * - Payments result flow
 * - Route: /dashboard/payment-success
 *
 * Opened from:
 * - SendToUpi.jsx
 * - SendToSelf.jsx
 * - SendToBank.jsx
 *
 * Purpose:
 * Displays successful payment receipt with
 * download, share, and navigation options.
 */





import { useLocation, useNavigate } from "react-router-dom";
import { Download, Share2 } from "lucide-react";
import appLogo from "@/assets/logo.png";
import upiLogo from "@/assets/upi.png";

const PaymentSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state) return null;

  const receiptText = `
Payment Successful
------------------
To: ${state.to}
Amount: ₹${state.amount}
Mode: ${state.mode}
Time: ${state.time}
`;

  const downloadReceipt = () => {
    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "payment-receipt.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareReceipt = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Payment Receipt",
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
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md text-center">

          {/* ✅ SUCCESS TICK ANIMATION */}
          <div className="flex justify-center mb-3">
            <svg className="w-16 h-16" viewBox="0 0 52 52">
              <circle
                cx="26"
                cy="26"
                r="25"
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                strokeDasharray="157"
                strokeDashoffset="157"
                className="animate-circle"
              />
              <path
                fill="none"
                stroke="#22c55e"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14 27l7 7 17-17"
                strokeDasharray="48"
                strokeDashoffset="48"
                className="animate-check"
              />
            </svg>
          </div>

          <h2 className="text-2xl font-semibold text-green-600 mb-3">
            Payment Successful
          </h2>

          {/* LOGOS */}
          <div className="flex justify-center items-center gap-3 mb-5">
            <img src={appLogo} alt="App Logo" className="h-8" />
            <span className="text-gray-400 text-lg font-semibold">/</span>
            <img src={upiLogo} alt="UPI Logo" className="h-10" />
          </div>

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

          <button
            onClick={() => navigate("/dashboard/transfers")}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg"
          >
            Done
          </button>
        </div>
      </div>

      {/* ✅ SUCCESS ANIMATION CSS */}
      <style>
        {`
        .animate-circle {
          animation: circle 0.6s ease-out forwards;
        }

        .animate-check {
          animation: check 0.4s ease-out 0.6s forwards;
        }

        @keyframes circle {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes check {
          to {
            stroke-dashoffset: 0;
          }
        }
        `}
      </style>
    </>
  );
};

export default PaymentSuccess;
