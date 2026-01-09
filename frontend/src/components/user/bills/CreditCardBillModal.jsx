import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EnterPinModal from "../payments/EnterPinModal";

const CreditCardBillModal = ({ onClose }) => {
  const navigate = useNavigate();

  const [cardLast4, setCardLast4] = useState("");
  const [amount, setAmount] = useState("");
  const [showPin, setShowPin] = useState(false);

  const isValidCard = cardLast4.length === 4;
  const isValidAmount = Number(amount) > 0;

  const handleCancel = () => {
    setCardLast4("");
    setAmount("");
    onClose();
  };

  return (
    <>
      {!showPin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md space-y-5">
            <h3 className="text-lg font-semibold">Credit Card Bill</h3>

            <input
              maxLength={4}
              value={cardLast4}
              onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ""))}
              placeholder="Last 4 digits"
              className="w-full border rounded-xl px-4 py-3"
            />

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Bill amount"
              className="w-full border rounded-xl px-4 py-3"
            />

            <button
              disabled={!isValidCard || !isValidAmount}
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
              to: `XXXX-XXXX-XXXX-${cardLast4}`,
              amount,
              mode: "UPI",
              purpose: "Credit Card Bill",
              time: new Date().toLocaleString(),
            },
          });
        }}
      />
    </>
  );
};

export default CreditCardBillModal;
