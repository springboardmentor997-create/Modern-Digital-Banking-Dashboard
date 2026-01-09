import { useState } from "react";
import BaseBillModal from "./BaseBillModal";

const OPERATORS = ["Jio", "Airtel", "Vi", "BSNL"];

const PLANS = [
  { amount: 199, desc: "1.5GB/day • 28 days" },
  { amount: 299, desc: "2GB/day • 28 days" },
  { amount: 599, desc: "2GB/day • 84 days" },
];

const MobileRechargeModal = ({ onClose }) => {
  const [step, setStep] = useState(1);
  const [mobile, setMobile] = useState("");
  const [operator, setOperator] = useState("");
  const [plan, setPlan] = useState(null);

  const isValidMobile = mobile.length === 10;

  const reset = () => {
    setStep(1);
    setMobile("");
    setOperator("");
    setPlan(null);
    onClose();
  };

  return (
    <BaseBillModal
      title="Mobile Recharge"
      onClose={onClose}
      confirmData={{
        to: mobile,
        amount: plan?.amount,
        mode: "UPI",
        purpose: "Mobile Recharge",
        operator,
        plan: plan?.desc,
      }}
    >
      {({ openPin }) => (
        <>
          {/* STEP 1 : MOBILE NUMBER */}
          {step === 1 && (
            <div className="space-y-6">
              <input
                value={mobile}
                onChange={(e) =>
                  setMobile(e.target.value.replace(/\D/g, ""))
                }
                maxLength={10}
                placeholder="Enter mobile number"
                className="w-full border rounded-xl px-4 py-3 text-lg"
              />
              <button
                disabled={!isValidMobile}
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl disabled:opacity-40"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 2 : OPERATOR */}
          {step === 2 && (
            <div className="space-y-6">
              <button
                onClick={() => setStep(1)}
                className="text-sm text-blue-600"
              >
                ← Back
              </button>

              <p className="text-sm font-medium">Select Operator</p>
              <div className="grid grid-cols-2 gap-3">
                {OPERATORS.map((op) => (
                  <button
                    key={op}
                    onClick={() => setOperator(op)}
                    className={`border rounded-xl py-3 font-medium ${
                      operator === op ? "border-blue-600 bg-blue-50" : ""
                    }`}
                  >
                    {op}
                  </button>
                ))}
              </div>

              <button
                disabled={!operator}
                onClick={() => setStep(3)}
                className="w-full bg-blue-600 text-white py-3 rounded-xl disabled:opacity-40"
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
                {PLANS.map((p) => (
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
                className="w-full bg-blue-600 text-white py-3 rounded-xl disabled:opacity-40"
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

              <div className="border rounded-xl p-4 space-y-1 text-sm">
                <p><b>Mobile:</b> {mobile}</p>
                <p><b>Operator:</b> {operator}</p>
                <p><b>Plan:</b> {plan.desc}</p>
                <p><b>Amount:</b> ₹{plan.amount}</p>
              </div>

              <button
                onClick={openPin}
                className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
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

export default MobileRechargeModal;
