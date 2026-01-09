import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "@/services/api";

const OTP_LENGTH = 6;
const RESEND_TIME = 60;

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const initialState = location.state;
  const email = initialState?.email || "";
  const mode = initialState?.mode || "";
  const accountID = initialState?.accountID || null;

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [timer, setTimer] = useState(RESEND_TIME);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inputsRef = useRef([]);

  // 🔒 Redirect safety (FIXED)
  useEffect(() => {
    if (!email || !mode) {
      navigate("/login", { replace: true });
    }
  }, [initialState, email, mode, navigate]);

  // ⏱ Timer countdown
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // 🔢 Handle input
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1].focus();
    }
  };

  // ⬅ Backspace handling
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  // 📋 Paste OTP support
  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData("text").slice(0, OTP_LENGTH);
    if (!/^\d+$/.test(pasted)) return;

    const pastedOtp = pasted.split("");
    setOtp(pastedOtp);

    pastedOtp.forEach((digit, i) => {
      if (inputsRef.current[i]) {
        inputsRef.current[i].value = digit;
      }
    });
  };

  // ✅ Verify OTP (CORRECT)
  const handleVerify = async () => {
    const finalOtp = otp.join("");

    if (finalOtp.length !== OTP_LENGTH) {
      setError("Please enter the complete OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/verify-otp", {
        otp: finalOtp,
        email,
      });

      if (mode === "login") {
        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/dashboard", { replace: true });
        return;
      }


      if (mode === "change_pin") {
        navigate("/dashboard/accounts/change-pin", {
          state: { accountID },
          replace: true,
        });
        return;
      }

      if (mode === "reset_password") {
        navigate("/reset-password", {
          state: { email },
          replace: true,
        });
      }
    } catch {
      setError("Invalid or expired OTP");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Resend OTP
  const handleResend = async () => {
    try {
      setTimer(RESEND_TIME);
      setOtp(Array(OTP_LENGTH).fill(""));
      setError("");

      if (mode === "login") {
        await api.post("/auth/resend-login-otp", { email });
      }
      else if (mode === "change_pin") {
        await api.post("/auth/resend-pin-otp", { email });
      }
      else{
        await api.post("/auth/forgot-password", {
          email,
        });
      }
    } catch {
      setError("Unable to resend OTP. Try again later.");
    }
  };

  const maskedIdentifier = email
    ? email.replace(/(.{2}).+(@.+)/, "$1****$2")
    : "";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#eaf1f8",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "42px",
          borderRadius: "18px",
          width: "100%",
          maxWidth: "420px",
          textAlign: "center",
          boxShadow: `
            0 30px 60px rgba(15, 30, 54, 0.45),
            0 0 120px rgba(46, 90, 136, 0.45)
          `,
        }}
      >
        <h2>🔐 Verify OTP</h2>

        <p style={{ marginBottom: "18px" }}>
          OTP sent to <strong>{maskedIdentifier}</strong>
        </p>

        <div
          onPaste={handlePaste}
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "10px",
            marginBottom: "20px",
          }}
        >
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              style={{
                width: "46px",
                height: "52px",
                textAlign: "center",
                fontSize: "20px",
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
              }}
            />
          ))}
        </div>

        {error && <p style={{ color: "#dc2626" }}>{error}</p>}

        <button
          onClick={handleVerify}
          disabled={loading || otp.join("").length !== OTP_LENGTH}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            fontWeight: "600",
          }}
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        <p style={{ marginTop: "16px" }}>
          Resend in 00:{timer.toString().padStart(2, "0")}
        </p>

        <button onClick={handleResend} disabled={timer !== 0}>
          Resend OTP
        </button>
      </div>
    </div>
  );
};

export default VerifyOtp;
