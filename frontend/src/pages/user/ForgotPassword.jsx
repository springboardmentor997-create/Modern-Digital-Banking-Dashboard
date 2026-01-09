/**
 * Forgot password page
 *
 * Part of:
 * - Authentication flow
 * - Route: /forgot-password
 *
 * Purpose:
 * Allows users to request password reset.
 */

import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import api from "@/services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || loading) return;

    try {
      setLoading(true);
      await api.post("/auth/forgot-password", { email });

      navigate("/verify-otp", {
        state: { email },
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Email not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>
      <div style={card}>
        <h2 style={{ marginBottom: "10px" }}>🔑 Forgot Password</h2>

        <p style={desc}>
          Enter your registered email to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={input}
          />

          {error && (
            <p style={{ color: "#dc2626", fontSize: "14px", marginBottom: "10px" }}>
              {error}
            </p>
          )}

          <button 
            type="submit" 
            disabled={loading}
            style={{
              ...button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
            >
            {loading ? "sending OTP..." : "Confirm Email"}
          </button>

          {loading && (
            <p style={{ fontSize: "13px", marginTop: "8px", color: "#64748b" }}>
              Please wait, we are Sending OTP...
            </p>
          )}

        </form>

        <p style={{ marginTop: "20px", fontSize: "14px" }}>
          <Link to="/login" style={link}>
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;

/* ================= STYLES ================= */

const page = {
  minHeight: "100vh",
  background: "#eaf1f8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
};

const card = {
  background: "#ffffff",
  padding: "40px",
  borderRadius: "18px",
  width: "100%",
  maxWidth: "420px",
  textAlign: "center",
  boxShadow: `
    0 30px 60px rgba(15, 30, 54, 0.45),
    0 0 120px rgba(46, 90, 136, 0.45)
  `,
};

const desc = {
  fontSize: "15px",
  color: "#64748b",
  marginBottom: "24px",
};

const input = {
  width: "100%",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "15px",
};

const button = {
  width: "100%",
  backgroundColor: "#2E5A88",
  color: "#ffffff",
  padding: "12px",
  borderRadius: "10px",
  border: "none",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
};

const link = {
  color: "#2E5A88",
  fontWeight: 600,
};
