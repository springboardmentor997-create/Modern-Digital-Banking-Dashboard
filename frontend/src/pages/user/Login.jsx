/**
 * Login page
 *
 * Part of:
 * - Authentication flow
 * - Route: /login
 *
 * Connected Files:
 * - Uses: services/api.js (auth)
 * - On success → Dashboard.jsx
 *
 * Purpose:
 * Authenticates user and stores tokens
 * for protected route access.
 */




import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import api from "@/services/api";
import logo from "@/assets/logo.png";
import loginImage from "@/assets/login-illustration.png";
import "./Login.css";

const Login = () => {
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [identifierError, setIdentifierError] = useState("");

  // Real-time validation for identifier
  const validateIdentifier = (value) => {
    if (!value) {
      setIdentifierError("");
      return;
    }
    
    const isEmail = value.includes("@");
    const isPhone = /^\d{10}$/.test(value);
    
    if (isEmail) {
      if (!value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setIdentifierError("Please enter a valid email address format (e.g., user@example.com)");
      } else {
        setIdentifierError("");
      }
    } else if (value.match(/^\d+$/)) {
      if (value.length < 10) {
        setIdentifierError("Phone number must be exactly 10 digits");
      } else if (value.length > 10) {
        setIdentifierError("Phone number cannot exceed 10 digits");
      } else {
        setIdentifierError("");
      }
    } else {
      setIdentifierError("Enter a valid email address or 10-digit phone number");
    }
  };


  const handleLogin = async (e) => {
    e.preventDefault();
    if (!identifier || !password || loading) return;
    
    setLoading(true); // 👈 START loading

    const isEmail = identifier.includes("@");
    const isPhone = /^\d{10}$/.test(identifier);

    if (!isEmail && !isPhone){
      alert("Please enter a valid email address or 10-digit phone number.");
      setLoading(false); // 👈 STOP loading
      return;
    }

    // Additional email validation for @ symbol
    if (identifier.includes("@") && !identifier.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert("Please enter a valid email address with proper format.");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/login/cookie", {
        identifier,
        password,
      });

      if (res.data.otp_required) {
        // 🚫 DO NOT STORE TOKEN
        // 🚫 DO NOT SET isLoggedIn
        navigate("/verify-otp", {
          state: { 
            email: isEmail ? identifier : res.data.email,
            mode: "login",
           },
        });
        return;
      }

      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("isLoggedIn", "true");

      const user = res.data.user;
      localStorage.setItem(
        "user", 
        JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          is_admin: user.is_admin,
      })
      );

      if(user.is_admin){
        navigate("/admin");      // ✅ FIX
      } else {       
        navigate("/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false); // 👈 ALWAYS stop loading
    }
  };

  return (
    <div style={pageStyle} className="login-page">
      {/* HEADER (SAME AS REGISTER) */}
      <div style={topHeader}>
        <img src={logo} alt="Aureus logo" style={logoStyle} />
        <span style={appName}>Aureus</span>
      </div>

      {/* CONTENT */}
      <div style={contentWrap} className="login-content-wrap">
        {/* LEFT */}
        <div style={leftSide} className="login-left-side">
          <h1 style={leftTitle}>Modern Digital Banking</h1>
          <p style={leftDesc}>
            Secure, fast and simple banking experience built for modern users.
            Manage accounts, transactions and security in one place.
          </p>

          <img
            src={loginImage}
            alt="Banking"
            style={illustrationStyle}
          />

          {/* BOTTOM TEXT */}
          <div style={appDownloadBottom}>
            <p style={appDownloadText}>
              <br /> <br />→ Start managing your digital banking easily. Try Aureus now!
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div style={rightSide}>
          <div style={formCard} className="login-form-card">
            <h2>Login</h2>
            <p style={{ color: "#6b7280", marginBottom: "20px" }}>
              Sign in to your account to continue
            </p>

            <form onSubmit={handleLogin}>
              <div style={fullRow}>
                <label>
                  Email Address or Mobile Number <span style={star}>*</span>
                </label>
                <input
                  type="text"
                  value={identifier}
                  placeholder="Enter Email Address or Mobile Number"
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    validateIdentifier(e.target.value);
                  }}
                  style={{
                    ...inputStyle,
                    borderColor: identifierError ? "#dc2626" : "#d1d5db",
                  }}
                  className="login-input"
                  required
                />
                {identifierError && (
                  <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "4px" }}>
                    {identifierError}
                  </p>
                )}
              </div>

              <div style={fullRow}>
                <label>
                  Password <span style={star}>*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  placeholder="Enter Password"
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  className="login-input"
                  required
                />
              </div>

              <div style={{ textAlign: "right", marginBottom: "20px" }}>
                <Link to="/forgot-password" style={forgotLink}>
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="login-button"
                style={{
                  ...buttonStyle,
                  background: loading ? "#94a3b8" : "#2E5A88",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Logging in..." : "Sign in"}
              </button>

            </form>

            <p style={{ textAlign: "center", marginTop: "16px" }}>
              Don&apos;t have an account?{" "}
              <Link to="/register" style={{ color: "#2E5A88", fontWeight: 600 }}>
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

/* ================= STYLES ================= */

const pageStyle = {
  minHeight: "100vh",
  background: "#eaf1f8",
  padding: "24px",
};

const topHeader = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "30px",
};

const logoStyle = { height: "36px" };

const appName = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#2E5A88",
};

const contentWrap = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  alignItems: "center",
  minHeight: "calc(100vh - 120px)",
};

const leftSide = {
  display: "flex",
  flexDirection: "column",
  paddingLeft: "40px",
  height: "100%",
};

const leftTitle = {
  fontSize: "34px",
  fontWeight: "700",
  color: "#2E5A88",
  marginBottom: "10px",
};

const leftDesc = {
  maxWidth: "520px",
  color: "#475569",
  fontSize: "15px",
  lineHeight: "1.6",
};

const illustrationStyle = {
  width: "100%",
  maxWidth: "520px",
  marginTop: "40px",
};

const appDownloadBottom = {
  marginTop: "auto",
};

const appDownloadText = {
  fontSize: "14px",
  color: "#475569",
  maxWidth: "420px",
};

const rightSide = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const formCard = {
  background: "#ffffff",
  padding: "28px",
  borderRadius: "18px",
  width: "100%",
  maxWidth: "420px",
  boxShadow: `
    0 30px 60px rgba(15, 30, 54, 0.45),
    0 0 120px rgba(46, 90, 136, 0.45)
  `,
};

const fullRow = {
  marginBottom: "16px",
  display: "grid",
  gap: "6px",
};

const inputStyle = {
  width: "100%",
  height: "44px",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #d1d5db",
  fontSize: "14px",
};

const buttonStyle = {
  width: "100%",
  marginTop: "10px",
  padding: "12px",
  background: "#2E5A88",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  fontWeight: "600",
  cursor: "pointer",
};

const forgotLink = {
  fontSize: "14px",
  color: "#4f46e5",
  textDecoration: "none",
  fontWeight: "500",
};

const star = { color: "#dc2626" };
