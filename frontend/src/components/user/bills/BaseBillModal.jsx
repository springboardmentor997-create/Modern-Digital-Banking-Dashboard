import { useState } from "react";
import { useNavigate } from "react-router-dom";
import EnterPinModal from "../payments/EnterPinModal";

const BaseBillModal = ({
  title,
  children,
  confirmData,
  onClose,
}) => {
  const navigate = useNavigate();
  const [showPin, setShowPin] = useState(false);

  return (
    <>
      {/* MAIN MODAL */}
      {!showPin && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">{title}</h3>
            {children({ openPin: () => setShowPin(true) })}
          </div>
        </div>
      )}

      {/* PIN MODAL */}
      <EnterPinModal
        open={showPin}
        onClose={() => setShowPin(false)}
        onConfirm={() => {
          setShowPin(false);
          onClose();
          navigate("/dashboard/bill-processing", {
            state: {
              ...confirmData,
              time: new Date().toLocaleString(),
            },
          });
        }}
      />
    </>
  );
};

export default BaseBillModal;
