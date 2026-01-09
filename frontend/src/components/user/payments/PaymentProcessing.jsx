/**
 * Component: PaymentProcessing
 *
 * Purpose:
 * - Shows a temporary processing/loading state after PIN confirmation
 * - Simulates real bank processing delay before result
 *
 * Key Behavior:
 * - Displays spinner / loader
 * - Waits for a dynamic time (timeout)
 * - Navigates to success or failure page after processing
 *
 * Connected Files:
 * - Used after PIN confirmation in:
 *   - SendToUpi.jsx
 *   - SendToBank.jsx
 *   - SendToSelf.jsx
 *
 * Note:
 * - This is frontend-only simulation
 * - Actual success/failure is decided before navigation
 */




const PaymentProcessing = ({ open }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white px-8 py-6 rounded-xl shadow-lg text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg font-medium">Processing payment…</p>
        <p className="text-sm text-gray-500 mt-1">
          Please wait, do not refresh
        </p>
      </div>
    </div>
  );
};

export default PaymentProcessing;
