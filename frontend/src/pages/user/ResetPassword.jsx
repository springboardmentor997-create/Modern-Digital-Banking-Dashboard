/**
 * Reset password page
 *
 * Part of:
 * - Authentication flow
 * - Route: /reset-password
 *
 * Purpose:
 * Allows users to set a new password
 * after verification.
 */




/**
 * Reset password page
 *
 * Route: /reset-password
 */

import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "@/services/api";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  if (!email) {
    navigate("/forgot-password");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        email,
        new_password: password,
      });

      localStorage.removeItem("resetOtp");
      localStorage.removeItem("otpExpiry");
      localStorage.removeItem("resetEmail");

      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Password must be strong and not same as old password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #eef5fb 0%, #f8fbff 50%, #eef5fb 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "40px",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "380px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
          textAlign: "center",
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>🔁 Reset Password</h2>

        <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}>
          Password must be at least 8 characters with uppercase, lowercase,
          number and special character.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "14px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "15px",
            }}
          />

          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "14px",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              fontSize: "15px",
            }}
          />

          {error && (
            <p style={{ color: "#dc2626", fontSize: "14px" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              backgroundColor: "#2E5A88",
              color: "#ffffff",
              padding: "12px",
              borderRadius: "10px",
              border: "none",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "10px",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Updating..." : "🔐 Update Password"}
          </button>
        </form>

        <p style={{ marginTop: "20px", fontSize: "14px" }}>
          <Link to="/login" style={{ color: "#7c3aed" }}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
