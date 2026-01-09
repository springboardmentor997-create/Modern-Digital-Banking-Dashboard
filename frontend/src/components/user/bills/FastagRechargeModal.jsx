import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EnterPinModal from "../payments/EnterPinModal";

const FastagRechargeModal = ({ onClose }) => {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [vehicleNo, setVehicleNo] = useState("");
  const [amount, setAmount] = useState("");
  const [showPin, setShowPin] = useState(false);

  const isValidVehicle = vehicleNo.length >= 6;
  const isValidAmount = Number(amount) > 0;

  const handleCancel = () => {
    setStep(1);
    setVehicleNo("");
    setAmount("");
    onClose();
  };

  const renderVehicleStep = () => (
    <div className="space-y-6">
      <label className="text-sm font-medium">Vehicle Number</label>
      <input
        value={vehicleNo}
        onChange={(e) => setVehicleNo(e.target.value.toUpperCase())}
        placeholder="TN09AB1234"
        className="w-full border rounded-xl px-4 py-3"
      />
      <button
        disabled={!isValidVehicle}
        onClick={() => setStep(2)}
        className="w-full bg-blue-600 text-white py-3 rounded-xl disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  );

  const renderAmountStep = () => (
    <div className="space-y-6">
      <button onClick={() => setStep(1)} className="text-sm text-blue-600">
        ← Back
      </button>
      <label className="text-sm font-medium">Recharge Amount</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="w-full border rounded-xl px-4 py-3"
      />
      <button
        disabled={!isValidAmount}
        onClick={() => setStep(3)}
        className="w-full bg-blue-600 text-white py-3 rounded-xl disabled:opacity-40"
      >
        Continue
      </button>
    </div>
  );

  const renderConfirmStep = () => (
    <div className="space-y-5">
      <button onClick={() => setStep(2)} className="text-sm text-blue-600">
        ← Back
      </button>
      <div className="border rounded-xl p-4 text-sm space-y-1">
        <p><b>Vehicle:</b> {vehicleNo}</p>
        <p><b>Amount:</b> ₹{amount}</p>
      </div>
      <button
        onClick={() => setShowPin(true)}
        className="w-full bg-blue-600 text-white py-3 rounded-xl"
      >
        Pay ₹{amount}
      </button>
      <button onClick={handleCancel} className="w-full text-sm text-gray-500">
        Cancel
      </button>
    </div>
  );

  return (
    <>
      {!showPin && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">FASTag Recharge</h3>
            {step === 1 && renderVehicleStep()}
            {step === 2 && renderAmountStep()}
            {step === 3 && renderConfirmStep()}
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
              to: vehicleNo,
              amount,
              mode: "UPI",
              purpose: "FASTag Recharge",
              time: new Date().toLocaleString(),
            },
          });
        }}
      />
    </>
  );
};

export default FastagRechargeModal;
