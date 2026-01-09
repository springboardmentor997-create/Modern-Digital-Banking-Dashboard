import { useState } from "react";
import BaseBillModal from "./BaseBillModal";

const SUBSCRIPTIONS = {
  Netflix: [
    { amount: 199, desc: "Mobile • 1 screen" },
    { amount: 499, desc: "Standard • 2 screens" },
    { amount: 649, desc: "Premium • 4 screens" },
  ],
  "Amazon Prime": [
    { amount: 299, desc: "Monthly Plan" },
    { amount: 1499, desc: "Yearly Plan" },
  ],
  Spotify: [
    { amount: 119, desc: "Individual • Monthly" },
    { amount: 179, desc: "Duo • Monthly" },
  ],
  "Disney+ Hotstar": [
    { amount: 299, desc: "Mobile • 3 months" },
    { amount: 899, desc: "Super • Yearly" },
  ],
  "YouTube Premium": [
    { amount: 129, desc: "Individual • Monthly" },
    { amount: 189, desc: "Family • Monthly" },
  ],
  "Apple Music": [
    { amount: 99, desc: "Individual • Monthly" },
    { amount: 149, desc: "Family • Monthly" },
  ],
};

const SubscriptionModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [service, setService] = useState("");
  const [subscriberId, setSubscriberId] = useState("");
  const [plan, setPlan] = useState(null);

  const reset = () => {
    setStep(1);
    setService("");
    setSubscriberId("");
    setPlan(null);
    onClose();
  };

  return (
    <BaseBillModal
      title="Subscription Payment"
      onClose={onClose}
      confirmData={{
        to: subscriberId,
        amount: plan?.amount,
        mode: "UPI",
        purpose: "Subscription Payment",
        service,
        plan: plan?.desc,
      }}
    >
      {({ openPin }) => (
        <>
          {/* STEP 1 : SELECT SERVICE */}
          {step === 1 && (
            <div className="space-y-4">
              {/* HEADER ROW */}
              <div className="flex items-center justify-between">
                <div />
                <button
                  onClick={onClose}
                  className="text-sm text-blue-600"
                >
                  ← Back
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {Object.keys(SUBSCRIPTIONS).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setService(s);
                      setStep(2);
                    }}
                    className="border rounded-xl py-3"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2 : SUBSCRIBER ID */}
          {step === 2 && (
            <div className="space-y-6">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-blue-600"
              >
                ← Back
              </button>

              <input
                value={subscriberId}
                onChange={(e) => setSubscriberId(e.target.value)}
                placeholder="Subscriber ID / Email"
                className="w-full border rounded-xl px-4 py-3"
              />

              <button
                disabled={subscriberId.length < 4}
                onClick={() => setStep(3)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 3 : PLAN */}
          {step === 3 && (
            <div className="space-y-6">
              <button
                onClick={() => setStep(2)}
                className="text-sm text-blue-600"
              >
                ← Back
              </button>

              <p className="text-sm font-medium">Select Plan</p>

              <div className="space-y-3">
                {SUBSCRIPTIONS[service].map((p) => (
                  <button
                    key={p.amount}
                    onClick={() => setPlan(p)}
                    className={`w-full border rounded-xl p-4 text-left ${
                      plan?.amount === p.amount
                        ? "border-blue-600 bg-blue-50"
                        : ""
                    }`}
                  >
                    <p className="font-semibold">₹{p.amount}</p>
                    <p className="text-sm text-gray-500">{p.desc}</p>
                  </button>
                ))}
              </div>

              <button
                disabled={!plan}
                onClick={() => setStep(4)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 4 : CONFIRM */}
          {step === 4 && (
            <div className="space-y-5">
              <button
                onClick={() => setStep(3)}
                className="text-sm text-blue-600"
              >
                ← Back
              </button>

              <div className="border rounded-xl p-4 text-sm space-y-1">
                <p><b>Service:</b> {service}</p>
                <p><b>Subscriber:</b> {subscriberId}</p>
                <p><b>Plan:</b> {plan.desc}</p>
                <p><b>Amount:</b> ₹{plan.amount}</p>
              </div>

              <button
                onClick={openPin}
                className="w-full bg-blue-600 text-white py-3 rounded-xl"
              >
                Pay ₹{plan.amount}
              </button>

              <button
                onClick={reset}
                className="w-full text-sm text-gray-500"
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
    </BaseBillModal>
  );
};

export default SubscriptionModal;
