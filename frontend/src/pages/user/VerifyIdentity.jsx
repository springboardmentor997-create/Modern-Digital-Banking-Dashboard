import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/services/api";

const VerifyIdentity = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const accountID = location.state?.accountId;

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!accountID) {
      navigate("/dashboard/accounts", { replace: true });
    }
  }, [accountID, navigate]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email || loading) return;
    try {
      setLoading(true);

      await api.post("/auth/forgot-password", { email });

      navigate("/dashboard/accounts/verify-otp", {
        state: { email, accountID },
      });
    } catch (err) {
      setError("Invalid email address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16">
      <h1 className="text-2xl font-semibold mb-2">Verify Identity</h1>
      <p className="text-sm text-gray-500 mb-6">
        Enter your registered email
      </p>

      <form onSubmit={handleSendOtp} className="space-y-4">
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-12 px-4 border rounded-lg"
          required
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button 
          type="submit"
          disabled={loading}
          className={`w-full h-12 rounded-lg text-white font-medium transition ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:opacity-90"
              }`}
              >
          {loading ? "Sending OTP..." : "Send OTP"}
        </button>

        {loading && (
          <p className="text-sm text-gray-500 text-center">
            Please wait, we are sending OTP...
          </p>
        )}
      </form>
    </div>
  );
};

export default VerifyIdentity;
