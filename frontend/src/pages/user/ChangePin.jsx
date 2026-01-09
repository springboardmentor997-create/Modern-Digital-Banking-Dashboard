import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/services/api";

const ChangePin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const accountID = location.state?.accountID;

  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  if (!accountID) {
    navigate("/dashboard/accounts");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      newPin.length !== 4 ||
      confirmPin.length !== 4
    ) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    if (newPin !== confirmPin) {
      setError("New PIN and Confirm PIN do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/accounts/change-pin", {
        account_id: accountID,
        new_pin: newPin,
      });

      alert("PIN changed successfully");
      navigate("/dashboard/accounts");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to change PIN. Please try again."
      );
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="max-w-xl mx-auto mt-12">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Change Account PIN</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update your account PIN to keep your account secure
        </p>
      </div>

      {/* FORM CARD */}
      <div className=" bg-white rounded-2xl shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">



          {/* NEW PIN */}
          <div>
            <label className="block text-sm font-medium mb-1">
              New PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={newPin}
              onChange={(e) => setNewPin(e.target.value)}
              className="w-full h-12 px-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new PIN"
            />
          </div>

          {/* CONFIRM PIN */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm New PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value)}
              className="w-full h-12 px-4 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm new PIN"
            />
          </div>

          {/* ERROR */}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* ACTIONS */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium hover:opacity-90 transition"
            >
              {loading ? "Updating..." : "Update PIN"}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 h-12 rounded-lg border font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ChangePin;
