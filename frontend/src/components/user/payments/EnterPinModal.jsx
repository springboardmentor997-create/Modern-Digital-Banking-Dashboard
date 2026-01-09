/**
 * Component: EnterPinModal
 *
 * Purpose:
 * - Collects the 4-digit transaction PIN from the user
 * - Used as a security step before confirming any payment
 *
 * Key Behavior:
 * - Displays a modal with masked PIN input (4 dots)
 * - Confirms PIN and sends it back to parent via onConfirm
 * - Disabled confirm button until exactly 4 digits are entered
 *
 * Connected Files:
 * - Used in: SendToUpi.jsx
 * - Used in: SendToBank.jsx
 * - Used in: SendToSelf.jsx
 *
 * Security Flow:
 * - PIN entered here is compared with stored transaction PIN
 *   (created during AddAccount process)
 */




import { useEffect, useRef, useState } from "react";

const EnterPinModal = ({ open, onClose, onConfirm }) => {
  const [pin, setPin] = useState("");
  const inputRef = useRef(null);

  // Auto focus when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* BACKDROP */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div
          className="bg-white w-full max-w-sm rounded-xl p-6 shadow-xl"
          onClick={() => inputRef.current?.focus()}
        >
          <h3 className="text-lg font-semibold text-center mb-5">
            Enter 4-digit PIN
          </h3>

          {/* PIN BOXES */}
          <div className="flex justify-center gap-3 mb-6 cursor-text">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-12 h-12 border rounded-lg flex items-center justify-center text-2xl ${
                  pin.length === i ? "border-indigo-600" : ""
                }`}
              >
                {pin[i] ? "●" : ""}
              </div>
            ))}
          </div>

          {/* REAL INPUT (INVISIBLE BUT FOCUSED) */}
          <input
            ref={inputRef}
            type="password"
            inputMode="numeric"
            maxLength={4}
            value={pin}
            onChange={(e) =>
              setPin(e.target.value.replace(/\D/g, ""))
            }
            className="absolute opacity-0 pointer-events-none"
          />

          <div className="flex gap-3">
            <button
              className="flex-1 border rounded-lg py-2"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              className="flex-1 bg-indigo-600 text-white rounded-lg py-2 disabled:opacity-50"
              disabled={pin.length !== 4}
              onClick={() => {
                onConfirm(pin);
                setPin("");
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EnterPinModal;
