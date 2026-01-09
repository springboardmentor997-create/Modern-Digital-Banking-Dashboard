/**
 * User registration page
 *
 * Part of:
 * - Authentication flow
 * - Route: /register
 *
 * Connected Files:
 * - Uses: services/api.js (auth)
 *
 * Purpose:
 * Registers a new user and initializes
 * basic account and security setup.
 */




import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "@/services/api";
import registerImage from "@/assets/register-illustration.png";
import logo from "@/assets/logo.png";
import "./Register.css";


const Register = () => {
  const navigate = useNavigate();

  // ================= FORM STATES =================
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pin, setPin] = useState("");
  const [kyc, setKyc] = useState(false);

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // ================= VALIDATION =================
  useEffect(() => {
    const newErrors = {};
    if (!name) newErrors.name = "Full name is required";
    
    // Email validation with @ symbol check
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!email.includes("@")) {
      newErrors.email = "Email must contain @ symbol";
    } else if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    if (!phone) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = "Phone number must be exactly 10 digits";
    }
    if (!dob) newErrors.dob = "Date of birth is required";
    if (!address) newErrors.address = "Address is required";
    
    // Strong password validation to match backend
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(password)) {
      newErrors.password = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    } else if (!/(?=.*[^A-Za-z0-9])/.test(password)) {
      newErrors.password = "Password must contain at least one special character";
    }
    
    if (!confirmPassword || password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    if (!pin || !/^\d{4}$/.test(pin))
      newErrors.pin = "PIN must be exactly 4 digits";
    if (!kyc) newErrors.kyc = "Please authorize KYC";
    setErrors(newErrors);
  }, [name, email, phone, dob, address, password, confirmPassword, pin, kyc]);

  // ================= SUBMIT =================
  const handleRegister = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (Object.keys(errors).length > 0) {
       alert("Please fill all required fields correctly before submitting.");
       return;
    }  

    try {
      const res = await api.post("/auth/register", {
        name,
        email,
        password,
        phone,
        dob: dob ? new Date(dob).toISOString().split("T")[0] : null,
        address,
        pin_code: pin,
        kyc_authorize: kyc,
      });

      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (err) {
      console.error("REGISTER ERROR:", err);

      alert(err.response?.data?.detail || "Registration failed. Please try again.");
    }
  };

  return (
    <div style={pageStyle} className="register-page">
      {/* HEADER */}
      <div style={topHeader}>
        <img src={logo} alt="Aureus logo" style={logoStyle} />
        <span style={appName}>Aureus</span>
      </div>

      {/* CONTENT */}
      <div style={contentWrap} className="register-content-wrap">
        {/* LEFT */}
        <div style={leftSide} className="register-left-side">
          <h1 style={leftTitle}>Modern Digital Banking</h1>
          <p style={leftDesc}>
            Secure, fast and simple banking experience built for modern users.
            Manage accounts, transactions and security in one place.
          </p>
          <img src={registerImage} alt="Banking" style={illustrationStyle} />

        {/* APP DOWNLOAD SECTION */}
        <div style={appDownloadWrap}>
           <p style={appDownloadText}>
            <br /> <br /> <br /> <br /> <br />→
            Start managing your digital banking easily.<br />
            Download the Aureus application now!
           </p>
        </div>
        </div>

        {/* RIGHT */}
        <div style={rightSide}>
          <div style={formCard} className="register-form-card">
            <h2>Create Account</h2>
            <p style={{ color: "#6b7280", marginBottom: "12px" }}>
              Register to get started with our modern banking services
            </p>

            <p style={{ fontSize: "13px", marginBottom: "20px" }}>
              Fields marked with <span style={{ color: "#dc2626" }}>*</span> are mandatory
            </p>

            {/* ===== FORM (UNCHANGED) ===== */}            

            <form noValidate onSubmit={handleRegister}>
              {/* Full Name */}
              <div style={fullRow}>
                <label>Full Name <span style={star}>*</span></label>
                <input style={inputStyle} className="register-input" value={name} placeholder="Enter Full Name" onChange={(e) => setName(e.target.value)} />
                {submitted && errors.name && <p style={errorStyle}>{errors.name}</p>}
              </div>

              {/* Email */}
              <div style={fullRow}>
                <label>Email Address <span style={star}>*</span></label>
                <input 
                  style={{
                    ...inputStyle,
                    borderColor: submitted && errors.email ? "#dc2626" : "#d1d5db",
                  }} 
                  className="register-input" 
                  value={email} 
                  placeholder="Enter Email Address" 
                  onChange={(e) => setEmail(e.target.value)} 
                />
                {submitted && errors.email && <p style={errorStyle}>{errors.email}</p>}
                {!submitted && email && !email.includes("@") && (
                  <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "4px" }}>
                    Email must contain @ symbol
                  </p>
                )}
                {!submitted && email && email.includes("@") && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && (
                  <p style={{ color: "#dc2626", fontSize: "13px", marginTop: "4px" }}>
                    Please enter a valid email format (e.g., user@example.com)
                  </p>
                )}
              </div>

              {/* Password */}
              <div style={twoColRow} className="register-two-col-row">
                <div>
                  <label>Password <span style={star}>*</span></label>
                  <input 
                    type="password" 
                    style={inputStyle} 
                    className="register-input"
                    placeholder="Enter Password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} 
                  />
                  {submitted && errors.password && <p style={errorStyle}>{errors.password}</p>}
                  {password && (
                    <div style={{ fontSize: "12px", marginTop: "4px", color: "#6b7280" }}>
                      Password must contain: uppercase, lowercase, number, special character (8+ chars)
                    </div>
                  )}
                </div>

                <div>
                  <label>Confirm Password <span style={star}>*</span></label>
                  <input 
                    type="password" 
                    style={inputStyle} 
                    className="register-input"
                    placeholder="Confirm Password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                  />
                  {submitted && errors.confirmPassword && <p style={errorStyle}>{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Phone & PIN */}
              <div style={twoColRow} className="register-two-col-row">
                <div>
                  <label>
                    Phone Number <span style={star}>*</span>
                  </label>
                  <input 
                    style={inputStyle} 
                    className="register-input"
                    value={phone}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    onKeyDown={(e) => {
                      // Allow only numbers, backspace, delete, arrows
                      if(
                        !/[0-9]/.test(e.key) &&
                        !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, ""); // remove non-numbers

                      // ❌ prevent starting with 0
                      if (value.startsWith("0")) {
                        value = value.slice(1);
                      }

                      // ❌ allow only first 10 digits
                      if (value.length > 10) {
                        value = value.slice(0, 10);
                      }
                      setPhone(value);
                    }}
                  />
                  {submitted && errors.phone && (
                    <p style={errorStyle}>{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label>Create PIN <span style={star}>*</span></label>
                  <input
                    style={inputStyle}
                    className="register-input"
                    value={pin}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="4-digit PIN"
                    maxLength={4}
                    onKeyDown={(e) => {
                      // Allow only numbers, backspace, delete, arrows
                      if(
                        !/[0-9]/.test(e.key) &&
                        !["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onChange={(e) =>
                      // Extra safety: remove anything not a digit
                      setPin(e.target.value.replace(/\D/g, ""))
                    }
                  />
                  {submitted && errors.pin && <p style={errorStyle}>{errors.pin}</p>}
                </div>
              </div>

              {/* DOB & Address */}
              <div style={twoColRow} className="register-two-col-row">
                <div>
                  <label>Date of Birth <span style={star}>*</span></label>
                  <input type="date" style={inputStyle} className="register-input" value={dob} placeholder="Select or Enter Date of Birth" onChange={(e) => setDob(e.target.value)} />
                  {submitted && errors.dob && <p style={errorStyle}>{errors.dob}</p>}
                </div>

                <div>
                  <label>Address <span style={star}>*</span></label>
                  <input style={inputStyle} className="register-input" value={address} placeholder="Enter Address" onChange={(e) => setAddress(e.target.value)} />
                  {submitted && errors.address && <p style={errorStyle}>{errors.address}</p>}
                </div>
              </div>

              {/* KYC */}
              <div style={{ marginTop: "16px" }}>
                <label>
                  <input type="checkbox" onChange={(e) => setKyc(e.target.checked)} />{" "}
                  I authorize the bank for KYC <span style={star}>*</span>
                </label>
                {submitted && errors.kyc && <p style={errorStyle}>{errors.kyc}</p>}
              </div>

              <button type="submit" style={buttonStyle} className="register-button">Create Account</button>
            </form>

            <p style={{ textAlign: "center", marginTop: "16px" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#2E5A88", fontWeight: 600 }}>
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  color: "#fff",
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
  justifyContent: "center",
  paddingLeft: "40px",
  height: "100%",
  gridColumn: "1 / 2",
};


const illustrationStyle = {
  width: "100%",
  maxWidth: "560px",
  marginTop: "40px",
};



const rightSide = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gridColumn: "2 / 3",
};

const formCard = {
  background: "#ffffff",
  padding: "32px",
  borderRadius: "18px",
  width: "100%",
  maxWidth: "540px",

  /* 🔥 THIS CREATES THE HERO-LIKE BLUE EFFECT */
  boxShadow: `
    0 30px 60px rgba(15, 30, 54, 0.45),
    0 0 120px rgba(46, 90, 136, 0.45)
  `,

  position: "relative",
  overflow: "hidden",
};


const fullRow = { marginBottom: "14px", display: "grid", gap: "6px" };
const twoColRow = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  columnGap: "16px",
  rowGap: "6px",
  marginBottom: "18px",
  alignItems: "flex-start",
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
  marginTop: "24px",
  padding: "12px",
  background: "#2E5A88",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  fontWeight: "600",
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

const appDownloadWrap = {
  gridColumn: "1 / 2",
  marginTop: "28px",
};


const appDownloadText = {
  fontSize: "14px",
  color: "#475569",
  marginBottom: "12px",
  maxWidth: "420px",
};





const errorStyle = { color: "#dc2626", fontSize: "13px" };
const star = { color: "#dc2626" };

export default Register;
