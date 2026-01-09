import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EnterPinModal from "../payments/EnterPinModal";

const GooglePlayRechargeModal = ({ onClose }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [showPin, setShowPin] = useState(false);

  const isValidEmail = email.includes("@");
  const isValidAmount = Number(amount) > 0;

  const handleCancel = () => {
    setEmail("");
    setAmount("");
    onClose();
  };

  return (
    <>
      {!showPin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-5">
            <h3 className="text-lg font-semibold">Google Play Recharge</h3>

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Google account email"
              className="w-full border rounded-xl px-4 py-3"
            />

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Amount"
              className="w-full border rounded-xl px-4 py-3"
            />

            <button
              disabled={!isValidEmail || !isValidAmount}
              onClick={() => setShowPin(true)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl disabled:opacity-40"
            >
              Pay ₹{amount}
            </button>

            <button onClick={handleCancel} className="text-sm text-gray-500">
              Cancel
            </button>
          </div>
        </div>
      )}

      <EnterPinModal
        open={showPin}
        onClose={() => setShowPin(false)}
        onConfirm={() => {
          setShowPin(false);
          onClose();
          navigate("/dashboard/bill-processing", {
            state: {
              to: email,
              amount,
              mode: "UPI",
              purpose: "Google Play Recharge",
              time: new Date().toLocaleString(),
            },
          });
        }}
      />
    </>
  );
};

export default GooglePlayRechargeModal;
