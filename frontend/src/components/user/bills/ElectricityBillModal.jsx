import { useState } from "react";
import BaseBillModal from "./BaseBillModal";

const PROVIDERS = ["TNEB", "APSPDCL", "TSSPDCL", "BESCOM", "MSEDCL"];

const ElectricityBillModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [consumerNo, setConsumerNo] = useState("");
  const [provider, setProvider] = useState("");
  const [amount, setAmount] = useState("");

  const isValidConsumer = consumerNo.length >= 6;
  const isValidAmount = Number(amount) > 0;

  const reset = () => {
    setStep(1);
    setConsumerNo("");
    setProvider("");
    setAmount("");
    onClose();
  };

  return (
    <BaseBillModal
      title="Electricity Bill Payment"
      onClose={onClose}
      confirmData={{
        to: consumerNo,
        amount,
        mode: "UPI",
        purpose: "Electricity Bill",
        provider,
      }}
    >
      {({ openPin }) => (
        <>
          {step === 1 && (
            <div className="space-y-6">
              <input
                value={consumerNo}
                onChange={(e) => setConsumerNo(e.target.value.replace(/\D/g, ""))}
                placeholder="Consumer Number"
                className="w-full border rounded-xl px-4 py-3"
              />
              <button
                disabled={!isValidConsumer}
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <button onClick={() => setStep(1)} className="text-sm text-blue-600">
                ← Back
              </button>
              <div className="grid grid-cols-2 gap-3">
                {PROVIDERS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    className={`border rounded-xl py-3 ${
                      provider === p ? "border-blue-600 bg-blue-50" : ""
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                disabled={!provider}
                onClick={() => setStep(3)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <button onClick={() => setStep(2)} className="text-sm text-blue-600">
                ← Back
              </button>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount"
                className="w-full border rounded-xl px-4 py-3"
              />
              <button
                disabled={!isValidAmount}
                onClick={() => setStep(4)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <div className="border rounded-xl p-4 text-sm">
                <p><b>Consumer:</b> {consumerNo}</p>
                <p><b>Provider:</b> {provider}</p>
                <p><b>Amount:</b> ₹{amount}</p>
              </div>
              <button
                onClick={openPin}
                className="w-full bg-blue-600 text-white py-3 rounded-xl"
              >
                Pay ₹{amount}
              </button>
              <button onClick={reset} className="w-full text-sm text-gray-500">
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </BaseBillModal>
  );
};

export default ElectricityBillModal;
