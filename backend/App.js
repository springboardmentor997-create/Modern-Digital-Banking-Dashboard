import React,{ useEffect, useState } from "react";
import api from "./api";
import axios from "axios";
<head>
  <meta charset="utf-8" />
  <link rel="icon" href="%PUBLIC_URL%/bank.png" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>🏦 Shreyas Bank</title>
</head>


function App() {
  const [currentPage, setCurrentPage] = useState("login"); 
  const [role, setRole] = useState(null); 

  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    const token = localStorage.getItem("token");

    if (token && savedRole) {
      setRole(savedRole);
      setCurrentPage("dashboard");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("role");

    setRole(null);
    setCurrentPage("login");
  };

  return (
    <div>
      {/* LOGIN */}
      {currentPage === "login" && (
        <LoginPage
          onSwitchToSignup={() => setCurrentPage("signup")}
          onLoginSuccess={(userRole) => {
            if (userRole === "forgot") {
              setCurrentPage("forgot");
            } else {
              setRole(userRole);
              setCurrentPage("dashboard");
            }
          }}
        />
      )}

      {/* SIGNUP */}
      {currentPage === "signup" && (
        <SignUpPage onSwitchToLogin={() => setCurrentPage("login")} />
      )}

      {/* FORGOT PASSWORD */}
      {currentPage === "forgot" && (
        <ResetPassword onBack={() => setCurrentPage("login")} />
      )}

      {/* USER DASHBOARD */}
      {currentPage === "dashboard" && role === "user" && (
        <Dashboard onLogout={handleLogout} />
      )}

      {/* ADMIN DASHBOARD */}
      {currentPage === "dashboard" && role === "admin" && (
        <AdminDashboard onLogout={handleLogout} />
      )}
    </div>
  );
}




function LoginPage({ onSwitchToSignup, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleLogin = async () => {
  if (!username || !password) {
    alert("Please fill all fields!");
    return;
  }

  try {
    const res = await axios.post(
      "http://localhost:8000/auth/token",
      new URLSearchParams({
        username: username,
        password: password,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

   localStorage.setItem("token", res.data.access_token);
localStorage.setItem("userId", res.data.user_id);
localStorage.setItem("role", res.data.role); // 👈 IMPORTANT


    alert("Welcome " + username + "! Login Successful!");
   if (res.data.role === "admin") {
  onLoginSuccess("admin");
} else {
  onLoginSuccess("user");
}


  } catch (error) {
    alert("Invalid username or password");
  }
};


  return (
    <div
  style={{
    minHeight: "100vh",
    background:
      "linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #fed7aa 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px 12px",
    overflowX: "hidden",
    overflowY: "auto",
  }}
>

      <div style={{ width: '100%', maxWidth: '380px' }}>
        
        {/* Logo & Title - Smaller */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-block',
            background: 'white',
            borderRadius: '50%',
            padding: '12px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '35px' }}>🏦</div>
          </div>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: 'bold', color: '#1f2937', marginBottom: '5px', margin: '0' }}>
            Welcome Back!
          </h1>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '5px 0 0 0' }}>Login to your account</p>
        </div>

        {/* Login Card - Compact */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          padding: '25px'
        }}>
          
          {/* Username Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '6px'
            }}>
              Username
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '10px', top: '9px', fontSize: '18px' }}>👤</span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                style={{
                  width: '100%',
                  paddingLeft: '38px',
                  paddingRight: '12px',
                  paddingTop: '9px',
                  paddingBottom: '9px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              color: '#374151',
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '10px', top: '9px', fontSize: '18px' }}>🔒</span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                style={{
                  width: '100%',
                  paddingLeft: '38px',
                  paddingRight: '42px',
                  paddingTop: '9px',
                  paddingBottom: '9px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '9px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
              >
                {showPassword ? '👁️' : '🙈'}
              </button>
            </div>
          </div>

          {/* Remember & Forgot */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '18px'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px', color: '#6b7280' }}>
              <input type="checkbox" style={{ marginRight: '6px', width: '14px', height: '14px' }} />
              Remember me
            </label>
           <button
  onClick={() => onLoginSuccess("forgot")}
  style={{
    background: "none",
    border: "none",
    fontSize: "12px",
    color: "#f97316",
    fontWeight: "600",
    cursor: "pointer"
  }}
>
  Forgot?
</button>


          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              fontWeight: 'bold',
              padding: '13px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.3s'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 16px rgba(59, 130, 246, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            Login
          </button>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', margin: '18px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
            <span style={{ padding: '0 12px', fontSize: '12px', color: '#9ca3af' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }}></div>
          </div>

          {/* Sign Up Link */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0' }}>
              Don't have an account?{' '}
              <button
                onClick={onSwitchToSignup}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f97316',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textDecoration: 'underline',
                  padding: '0'
                }}
              >
                Sign Up
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '11px', color: '#9ca3af' }}>
          <p style={{ margin: '0' }}>© 2024 SecureBank</p>
        </div>
      </div>
    </div>
  );
}


function ResetPassword({ onBack }) {
  const [username, setUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleReset = async () => {
    if (!username || !newPassword || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await axios.post("http://localhost:8000/auth/reset-password", {
        username,
        new_password: newPassword,
      });

      alert("✅ Password updated successfully");
      onBack();
    } catch (err) {
      alert("❌ User not found");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #fed7aa 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px 12px",
overflowY: "auto",
overflowX: "hidden",

      }}
    >
      <div style={{ width: "100%", maxWidth: "380px" }}>
        {/* ===== HEADER ===== */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              display: "inline-block",
              background: "white",
              borderRadius: "50%",
              padding: "14px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
              marginBottom: "12px",
            }}
          >
            <span style={{ fontSize: "34px" }}>🔐</span>
          </div>
          <h2 style={{ fontSize: "clamp(20px, 5vw, 24px)", fontWeight: "900", margin: 0 }}>

            Reset Password
          </h2>
          <p style={{ fontSize: "13px", color: "#6b7280", marginTop: "6px" }}>
            Create a new secure password
          </p>
        </div>

        {/* ===== CARD ===== */}
        <div
          style={{
            background: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
          }}
        >
          {/* USERNAME */}
          <div style={{ marginBottom: "14px" }}>
            <label style={labelStyle}>Username / Email</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter registered email"
              style={inputStyle}
            />
          </div>

          {/* NEW PASSWORD */}
          <div style={{ marginBottom: "14px", position: "relative" }}>
            <label style={labelStyle}>New Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              style={inputStyle}
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div style={{ marginBottom: "18px", position: "relative" }}>
            <label style={labelStyle}>Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              style={inputStyle}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "38px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          {/* RESET BUTTON */}
          <button
            onClick={handleReset}
            style={{
              width: "100%",
              height: "42px",
              background:
                "linear-gradient(135deg, #3b82f6, #2563eb)",
              color: "white",
              fontWeight: "800",
              borderRadius: "10px",
              border: "none",
              cursor: "pointer",
              fontSize: "15px",
              boxShadow: "0 4px 12px rgba(59,130,246,0.35)",
            }}
          >
            🔁 Update Password
          </button>

          {/* BACK */}
          <button
            onClick={onBack}
            style={{
              marginTop: "12px",
              width: "100%",
              height: "38px",
              background: "transparent",
              border: "none",
              color: "#f97316",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            ⬅ Back to Login
          </button>
        </div>

        {/* FOOTER */}
        <p
          style={{
            textAlign: "center",
            fontSize: "11px",
            color: "#9ca3af",
            marginTop: "14px",
          }}
        >
          © 2024 SecureBank
        </p>
      </div>
    </div>
  );
}

/* ===== SHARED STYLES ===== */
const labelStyle = {
  display: "block",
  fontSize: "13px",
  fontWeight: "700",
  color: "#374151",
  marginBottom: "6px",
};

const inputStyle = {
  width: "100%",
  height: "42px",
  padding: "0 14px",
  borderRadius: "10px",
  border: "2px solid #e5e7eb",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
};




// Sign Up Page Component
function SignUpPage({ onSwitchToLogin }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    accountType: 'savings',
    agreeTerms: false
  });
  const [role, setRole] = useState("user"); // user | admin

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

const handleSignUp = async () => {
  if (
    !formData.fullName ||
    !formData.email ||
    !formData.phone ||
    !formData.password ||
    !formData.confirmPassword
  ) {
    alert("Please fill all fields!");
    return;
  }
  

  if (formData.password !== formData.confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  if (!formData.agreeTerms) {
    alert("Please agree to Terms!");
    return;
  }

  try {
    await axios.post("http://localhost:8000/auth/register", {
  name: formData.fullName,
  email: formData.email,
  phone: formData.phone,
  password: formData.password,
  role: role   // "admin" or "user"
});



    alert("Account created successfully!");
    onSwitchToLogin();
  } catch (error) {
    alert("User already exists or error occurred");
  }
};


  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #fed7aa 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '15px',
      overflowX: 'hidden',
overflowY: 'auto'

    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        
        {/* Logo & Title */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-block',
            background: 'white',
            borderRadius: '50%',
            padding: '12px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
            marginBottom: '12px'
          }}>
            <div style={{ fontSize: '35px' }}>✨</div>
          </div>
          <h1 style={{ fontSize: 'clamp(20px, 5vw, 24px)', fontWeight: 'bold', color: '#1f2937', marginBottom: '5px', margin: '0' }}>
            Create Account
          </h1>
          <p style={{ color: '#6b7280', fontSize: '13px', margin: '5px 0 0 0' }}>Start your banking journey</p>
        </div>

        {/* Sign Up Card */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
          padding: '25px'
        }}>
          
          {/* Full Name */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', color: '#374151', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '10px', top: '9px', fontSize: '16px' }}>👤</span>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="Your full name"
                style={{
                  width: '100%',
                  paddingLeft: '35px',
                  paddingRight: '12px',
                  paddingTop: '9px',
                  paddingBottom: '9px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>

          {/* Email & Phone in 2 columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', color: '#374151', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '8px', top: '9px', fontSize: '14px' }}>📧</span>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@.com"
                  style={{
                    width: '100%',
                    paddingLeft: '30px',
                    paddingRight: '8px',
                    paddingTop: '9px',
                    paddingBottom: '9px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#374151', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Phone
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '8px', top: '9px', fontSize: '14px' }}>📱</span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="123456789"
                  style={{
                    width: '100%',
                    paddingLeft: '30px',
                    paddingRight: '8px',
                    paddingTop: '9px',
                    paddingBottom: '9px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>
            </div>
          </div>
          {/* Role Selection */}
<div style={{ marginBottom: '14px' }}>
  <label style={{ fontSize: '13px', fontWeight: '600', marginBottom: '6px', display: 'block' }}>
    Register As
  </label>

  <select
    value={role}
    onChange={(e) => setRole(e.target.value)}
    style={{
      width: '100%',
      padding: '10px',
      borderRadius: '8px',
      border: '2px solid #e5e7eb',
      fontSize: '14px'
    }}
  >
    <option value="user">User (Customer)</option>
    <option value="admin">Admin (System)</option>
  </select>
</div>


          {/* Account Type */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', color: '#374151', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
              Account Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                border: formData.accountType === 'savings' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                background: formData.accountType === 'savings' ? '#eff6ff' : 'white'
              }}>
                <input
                  type="radio"
                  checked={formData.accountType === 'savings'}
                  onChange={() => handleChange('accountType', 'savings')}
                  style={{ marginRight: '8px', width: '14px', height: '14px' }}
                />
                <div>
                  <div style={{ fontWeight: '600', color: '#374151', fontSize: '13px' }}>Savings</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>Personal</div>
                </div>
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                padding: '10px',
                border: formData.accountType === 'current' ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                background: formData.accountType === 'current' ? '#eff6ff' : 'white'
              }}>
                <input
                  type="radio"
                  checked={formData.accountType === 'current'}
                  onChange={() => handleChange('accountType', 'current')}
                  style={{ marginRight: '8px', width: '14px', height: '14px' }}
                />
                <div>
                  <div style={{ fontWeight: '600', color: '#374151', fontSize: '13px' }}>Current</div>
                  <div style={{ fontSize: '10px', color: '#9ca3af' }}>Business</div>
                </div>
              </label>
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', color: '#374151', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '8px', top: '9px', fontSize: '14px' }}>🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  placeholder="Password"
                  style={{
                    width: '100%',
                    paddingLeft: '30px',
                    paddingRight: '32px',
                    paddingTop: '9px',
                    paddingBottom: '9px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '9px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#374151', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Confirm
              </label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '8px', top: '9px', fontSize: '14px' }}>✅</span>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  placeholder="Re-enter"
                  style={{
                    width: '100%',
                    paddingLeft: '30px',
                    paddingRight: '32px',
                    paddingTop: '9px',
                    paddingBottom: '9px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '9px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {showConfirmPassword ? '👁️' : ''}
                </button>
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'start' }}>
              <input
                type="checkbox"
                checked={formData.agreeTerms}
                onChange={(e) => handleChange('agreeTerms', e.target.checked)}
                style={{ marginRight: '8px', marginTop: '2px', width: '14px', height: '14px' }}
              />
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                I agree to Terms & Conditions
              </span>
            </label>
          </div>

          {/* Sign Up Button */}
          <button
            onClick={handleSignUp}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              fontWeight: 'bold',
              padding: '11px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
              marginBottom: '16px'
            }}
          >
            Create Account
          </button>

          {/* Login Link */}
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0' }}>
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f97316',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '13px',
                  textDecoration: 'underline',
                  padding: '0'
                }}
              >
                Login
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '11px', color: '#9ca3af' }}>
          <p style={{ margin: '0' }}>© 2024 SecureBank</p>
        </div>
      </div>
    </div>
  );
}
function Dashboard({ onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [userId, setUserId] = useState(null);

  const [dashboardData, setDashboardData] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [rewards, setRewards] = useState(null);
  const [settings, setSettings] = useState(null);
  const [transferTo, setTransferTo] = useState("");
const [transferAmount, setTransferAmount] = useState("");
const [transferMessage, setTransferMessage] = useState("");
const [transferStatus, setTransferStatus] = useState("");
const [editName, setEditName] = useState("");
const [editPhone, setEditPhone] = useState("");

const [oldPassword, setOldPassword] = useState("");
const [newPassword, setNewPassword] = useState("");

const [settingsStatus, setSettingsStatus] = useState("");
const [showEditProfile, setShowEditProfile] = useState(false);
const [showChangePassword, setShowChangePassword] = useState(false);
const [budget, setBudget] = useState(0);
const [newBudget, setNewBudget] = useState("");
const [budgetStatus, setBudgetStatus] = useState("");
const [bills, setBills] = useState([]);
const [billTitle, setBillTitle] = useState("");
const [billAmount, setBillAmount] = useState("");
const [billDueDate, setBillDueDate] = useState("");
const [billStatus, setBillStatus] = useState("");
const [rewardInsights, setRewardInsights] = useState(null);

const [alerts, setAlerts] = useState([]);
const [showApplyCard, setShowApplyCard] = useState(false);
const [creditLimit, setCreditLimit] = useState("");
const [creditType, setCreditType] = useState("Silver");
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
  };
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

const sidebarIcons = {
  "Dashboard": "📊",
  "Accounts": "🏦",
  "Transactions": "💳",
  "Transfer Money": "💸",
  "Currency Exchange": "💱",
  "Rewards": "🎁",
  "Bills & Reminders": "🧾",   // ✅ ADD
  "Settings": "⚙️",
};




  const [activePage, setActivePage] = useState("Dashboard");
  //const [budget, setBudget] = useState(50000);

  const visits = Number(localStorage.getItem("visits") || 0) + 1;
  localStorage.setItem("visits", visits);

  

  // Currency Exchange
  const [fromCurrency, setFromCurrency] = useState("INR");
  const [toCurrency, setToCurrency] = useState("USD");
  const [exchangeAmount, setExchangeAmount] = useState(1000);

  const exchangeRate =
    fromCurrency === "INR" && toCurrency === "USD" ? 0.012 : 83;
  const convertedAmount = (exchangeAmount * exchangeRate).toFixed(2);
  const fetchSettings = async () => {
  try {
    const res = await api.get(`/settings/${userId}`);
    setSettings(res.data);
  } catch (err) {
    console.error("Failed to fetch settings", err);
  }
};
useEffect(() => {
  fetchSettings();
}, []);

const verifyKYC = async () => {
  try {
    await api.put(`/settings/kyc/${userId}`);
    alert("✅ KYC verified successfully");
    fetchSettings(); // 🔄 refresh status
  } catch (err) {
    alert("❌ Failed to verify KYC");
  }
};

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id) setUserId(id);
  }, []);

  /* 🔥 API CALLS ONLY WHEN SIDEBAR IS CLICKED */
 useEffect(() => {
  if (!userId) return;

  if (activePage === "Dashboard") {
  api.get(`/dashboard/${userId}`).then(res => setDashboardData(res.data));
  api.get(`/budget/${userId}`).then(res => setBudget(res.data.amount));

  // ✅ ADD THIS
  api.get(`/alerts/${userId}`)
  .then(res => setAlerts(res.data))
  .catch(() => setAlerts([]));

}


  if (activePage === "Accounts") {
    api.get(`/accounts/${userId}`).then(res => setAccounts(res.data));
  }

  if (activePage === "Transactions") {
    api.get(`/transactions/${userId}`).then(res => setTransactions(res.data));
  }

 
 if (activePage === "Rewards") {
  api.get(`/rewards/${userId}`).then(res => setRewards(res.data));
  api.get(`/rewards/insights/${userId}`).then(res =>
    setRewardInsights(res.data)
  );
}

if (activePage === "Bills & Reminders") {
  api.get(`/bills/${userId}`).then(res => setBills(res.data));
}

  if (activePage === "Settings") {
    api.get(`/settings/${userId}`).then(res => setSettings(res.data));
  }

}, [activePage, userId]);

  const cardStyle = {
    background: "white",
    padding: "20px",
    borderRadius: "16px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
  };
const handleTransfer = async () => {
  if (!transferTo || !transferAmount) {
    setTransferStatus("⚠️ Please fill all required fields");
    return;
  }

  try {
    await api.post(`/transfer/${userId}`, {
  to_user_id: Number(transferTo),   // receiver userId
  amount: Number(transferAmount),
  message: transferMessage,
});




    setTransferStatus("✅ Transfer successful");

    // clear inputs
    setTransferTo("");
    setTransferAmount("");
    setTransferMessage("");

    // 🔥 refresh dashboard + transactions
    api.get(`/dashboard/${userId}`).then(res => setDashboardData(res.data));
    api.get(`/transactions/${userId}`).then(res => setTransactions(res.data));

    // optional: auto switch to transactions
    setActivePage("Transactions");

  } catch (err) {
  console.error(err.response?.data || err.message);
  setTransferStatus(
    err.response?.data?.detail || "❌ Transfer failed"
  );
}

};
const handleAddBill = async () => {
  if (!billTitle || !billAmount || !billDueDate) {
    setBillStatus("⚠️ Fill all bill details");
    return;
  }

  setBillStatus("⏳ Adding bill..."); // ✅ loading state

  try {
    const res = await api.post(`/bills/${userId}`, {
      title: billTitle,
      amount: Number(billAmount),
      due_date: billDueDate,
    });

    // ✅ success
    setBills(prev => [res.data, ...prev]); // optimistic update

    setBillTitle("");
    setBillAmount("");
    setBillDueDate("");

    setBillStatus("✅ Bill added successfully");

  } catch (err) {
    console.error(err);

    setBillStatus(
      err.response?.data?.detail || "❌ Failed to add bill"
    );
  }
};


const handlePayBill = async (billId) => {
  await api.put(`/bills/pay/${billId}`);

  const res = await api.get(`/bills/${userId}`);
  setBills(res.data);
};

const handleSaveBudget = async () => {
  if (!newBudget || newBudget <= 0) {
    setBudgetStatus("⚠️ Enter valid budget");
    return;
  }

  try {
    await api.post(`/budget/${userId}`, {
      amount: Number(newBudget),
    });

    setBudget(newBudget);
    setNewBudget("");
    setBudgetStatus("✅ Budget saved successfully");

  } catch (err) {
    setBudgetStatus("❌ Failed to save budget");
  }
};const handleRedeem = async (amount) => {
  try {
    await api.post(`/rewards/redeem/${userId}`, null, {
      params: { amount },
    });

    alert(`₹${amount} credited successfully 🎉`);

    // refresh rewards + dashboard
    api.get(`/rewards/${userId}`).then(res => setRewards(res.data));
    api.get(`/dashboard/${userId}`).then(res => setDashboardData(res.data));

  } catch (err) {
    alert("❌ Redeem failed");
  }
};



const handleEditProfile = async () => {
  try {
    await api.put(`/settings/profile/${userId}`, {
      name: editName || settings.name,
      phone: editPhone || settings.phone,
    });

    setSettingsStatus("✅ Profile updated successfully");

    // refresh settings
    const res = await api.get(`/settings/${userId}`);
    setSettings(res.data);

  } catch (err) {
    setSettingsStatus(
      err.response?.data?.detail || "❌ Failed to update profile"
    );
  }
};

const handleChangePassword = async () => {
  if (!oldPassword || !newPassword) {
    setSettingsStatus("⚠️ Fill both password fields");
    return;
  }

  try {
    await api.put(`/settings/change-password/${userId}`, {
      old_password: oldPassword,
      new_password: newPassword,
    });

    setSettingsStatus("✅ Password changed successfully");

    setOldPassword("");
    setNewPassword("");

  } catch (err) {
    setSettingsStatus(
      err.response?.data?.detail || "❌ Password change failed"
    );
  }
};
const handleVerifyKYC = async () => {
  try {
    await api.put(`/settings/kyc/${userId}`);

    const res = await api.get(`/settings/${userId}`);
    setSettings(res.data);

    setSettingsStatus("✅ KYC verified successfully");
  } catch (err) {
    setSettingsStatus(
      err.response?.data?.detail || "❌ KYC verification failed"
    );
  }
};

const spent = dashboardData?.credit_used || 0;
const budgetLimit = budget || 1; // prevent divide by zero
const remaining = Math.max(budgetLimit - spent, 0);

const spentPercent = Math.min(
  Math.round((spent / budgetLimit) * 100),
  100
);

const isExceeded = spent > budget;
const handleAddAccount = async () => {
  await api.post(`/accounts/${userId}`);
  const res = await api.get(`/accounts/${userId}`);
  setAccounts(res.data);
};

const handleLinkAccount = async () => {
  await api.post(`/accounts/link/${userId}`);
  const res = await api.get(`/accounts/${userId}`);
  setAccounts(res.data);
};

const handleCloseAccount = async (accountId) => {
  try {
    await api.put(`/accounts/close/${accountId}`);
    const res = await api.get(`/accounts/${userId}`);
    setAccounts(res.data);
  } catch (err) {
    alert(err.response?.data?.detail || "Failed to close account");
  }
};
const inputBaseStyle = {
  width: "100%",
  boxSizing: "border-box",   // 🔥 MOST IMPORTANT
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  fontSize: "15px",
};

const inputStyle = {
  width: "100%",
  height: "48px",          // ✅ SAME HEIGHT FOR ALL
  padding: "0 14px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  fontSize: "15px",
  fontWeight: "600",
  outline: "none",
  boxSizing: "border-box", // ✅ VERY IMPORTANT
};



  const renderContent = () => {
    switch (activePage) {

case "Dashboard":
  return (
    <>
      {/* ================= HEADER ================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <h2 style={{ fontWeight: "800", fontSize: "26px" }}>
          📊 Financial Overview
        </h2>

        <span style={{ color: "#6b7280", fontSize: "14px" }}>
          Last updated just now
        </span>
      </div>

      {/* ================= ALERT CHIPS ================= */}
      {Array.isArray(alerts) && alerts.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            marginBottom: "14px",
            flexWrap: "wrap",
          }}
        >
          {alerts.map((alert, i) => (
            <div
              key={i}
              style={{
                padding: "8px 14px",
                borderRadius: "999px",
                fontSize: "13px",
                fontWeight: "700",
                background:
                  alert.type === "low_balance"
                    ? "linear-gradient(135deg, #fee2e2, #fecaca)"
                    : alert.type === "budget_exceeded"
                    ? "linear-gradient(135deg, #fef3c7, #fde68a)"
                    : "linear-gradient(135deg, #e0e7ff, #c7d2fe)",
                boxShadow: "0 6px 14px rgba(0,0,0,0.08)",
              }}
            >
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* ================= BUDGET HEALTH (TOP PRIORITY) ================= */}
      <div
        style={{
          background:
            "linear-gradient(135deg, rgba(22,163,74,0.15), rgba(16,185,129,0.08))",
          backdropFilter: "blur(12px)",
          padding: "18px",
          borderRadius: "18px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
          marginBottom: "16px",
          border:
            spentPercent > 90
              ? "1px solid #dc2626"
              : "1px solid rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "10px",
            fontWeight: "700",
          }}
        >
          <span>📉 Monthly Budget Health</span>
          <span>
            ₹{spent} / ₹{budget}
          </span>
        </div>

        <div
          style={{
            width: "100%",
            height: "16px",
            background: "#e5e7eb",
            borderRadius: "999px",
            overflowX: 'hidden',
overflowY: 'auto'

          }}
        >
          <div
            style={{
              width: `${spentPercent}%`,
              height: "100%",
              background:
                spentPercent > 90
                  ? "linear-gradient(90deg, #dc2626, #ef4444)"
                  : spentPercent > 75
                  ? "linear-gradient(90deg, #f59e0b, #fbbf24)"
                  : "linear-gradient(90deg, #16a34a, #22c55e)",
              transition: "width 0.5s ease",
            }}
          />
        </div>

        <p
          style={{
            marginTop: "8px",
            fontWeight: "700",
            color:
              spentPercent > 90
                ? "#dc2626"
                : spentPercent > 75
                ? "#f59e0b"
                : "#16a34a",
          }}
        >
          {budget === 0
            ? "Set a monthly budget to track spending"
            : spentPercent > 90
            ? "⚠️ Budget almost exhausted"
            : spentPercent > 75
            ? "⚠️ Spending is high"
            : "✅ Spending under control"}
        </p>
      </div>

      {/* ================= STATS GRID ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
  ? "1fr"
  : "repeat(4, 1fr)",

          gap: "14px",
          marginBottom: "14px",
        }}
      >
        {dashboardData &&
          [
            ["Balance", `₹${dashboardData.total_balance}`, "💰", "#2563eb"],
            ["Savings", `₹${dashboardData.savings}`, "🏦", "#16a34a"],
            ["Spent", `₹${dashboardData.credit_used}`, "💳", "#dc2626"],
            ["Rewards", `${dashboardData.rewards} pts`, "🎁", "#9333ea"],
          ].map(([label, value, icon, color]) => (
            <div
              key={label}
              style={{
                background: "rgba(255,255,255,0.85)",
                backdropFilter: "blur(10px)",
                borderRadius: "16px",
                padding: "16px",
                boxShadow: "0 15px 30px rgba(0,0,0,0.1)",
                position: "relative",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "14px",
                  fontSize: "26px",
                  opacity: 0.25,
                }}
              >
                {icon}
              </span>

              <p style={{ fontSize: "13px", color: "#6b7280" }}>{label}</p>
              <h2 style={{ fontSize: "24px", fontWeight: "800", color }}>
                {value}
              </h2>
            </div>
          ))}
      </div>

      {/* ================= QUICK BUDGET EDIT ================= */}
      <div
        style={{
          display: "flex",
flexDirection: isMobile ? "column" : "row",

          alignItems: "center",
          gap: "14px",
          background: "rgba(255,255,255,0.9)",
          padding: "14px",
          borderRadius: "14px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
        }}
      >
        <strong style={{ minWidth: "160px" }}>📊 Update Budget</strong>

        <input
          type="number"
          placeholder="Enter new budget"
          value={newBudget}
          onChange={(e) => setNewBudget(e.target.value)}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
          }}
        />

        <button
          onClick={handleSaveBudget}
          disabled={!newBudget}
          style={{
            background: "linear-gradient(135deg, #16a34a, #22c55e)",
            color: "white",
            border: "none",
            padding: "8px 18px",
            borderRadius: "999px",
            fontWeight: "700",
            cursor: newBudget ? "pointer" : "not-allowed",
            opacity: newBudget ? 1 : 0.6,
          }}
        >
          Save
        </button>

        {budgetStatus && (
          <span style={{ fontWeight: "700" }}>{budgetStatus}</span>
        )}
      </div>
    </>
  );



      /* ================= ACCOUNTS ================= */
case "Accounts":
  return (
    <>
      {/* ================= HEADER ================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "14px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "26px", fontWeight: "800" }}>
            🏦 My Accounts
          </h2>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>
            Overview of all your linked and active accounts
          </p>
        </div>

        <span
          style={{
            background: "#111827",
            color: "white",
            padding: "8px 14px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: "700",
          }}
        >
          {accounts.length} Accounts
        </span>
      </div>

      {/* ================= QUICK ACTION STRIP ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "14px",
          marginBottom: "18px",
        }}
      >
        <div
          onClick={handleAddAccount}
          style={{
            background:
              "linear-gradient(135deg, #16a34a, #22c55e)",
            color: "white",
            padding: "18px",
            borderRadius: "16px",
            cursor: "pointer",
            boxShadow: "0 15px 30px rgba(34,197,94,0.35)",
          }}
        >
          <h3 style={{ marginBottom: "6px" }}>➕ Open New Account</h3>
          <p style={{ fontSize: "13px", opacity: 0.9 }}>
            Create a fresh savings account instantly
          </p>
        </div>

        <div
          onClick={handleLinkAccount}
          style={{
            background:
              "linear-gradient(135deg, #2563eb, #3b82f6)",
            color: "white",
            padding: "18px",
            borderRadius: "16px",
            cursor: "pointer",
            boxShadow: "0 15px 30px rgba(59,130,246,0.35)",
          }}
        >
          <h3 style={{ marginBottom: "6px" }}>🔗 Link Account</h3>
          <p style={{ fontSize: "13px", opacity: 0.9 }}>
            Connect an existing external account
          </p>
        </div>
      </div>

      {/* ================= ACCOUNTS GRID ================= */}
      {accounts.length === 0 ? (
        <div
          style={{
            background: "rgba(255,255,255,0.9)",
            borderRadius: "18px",
            padding: "30px",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          }}
        >
          <h3 style={{ marginBottom: "8px" }}>😕 No accounts found</h3>
          <p style={{ color: "#6b7280" }}>
            Open or link an account to get started
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "18px",
          }}
        >
          {accounts.map((acc) => (
            <div
              key={acc.id}
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))",
                backdropFilter: "blur(12px)",
                borderRadius: "20px",
                padding: "22px",
                boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
                border:
                  acc.status === "Active"
                    ? "1px solid rgba(34,197,94,0.4)"
                    : "1px solid rgba(156,163,175,0.4)",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-6px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              {/* HEADER */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "10px",
                }}
              >
                <h3 style={{ margin: 0 }}>
                  💼 {acc.account_type}
                </h3>

                <span
                  style={{
                    padding: "5px 12px",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: "700",
                    background:
                      acc.status === "Active"
                        ? "#dcfce7"
                        : "#fee2e2",
                    color:
                      acc.status === "Active"
                        ? "#166534"
                        : "#991b1b",
                  }}
                >
                  {acc.status}
                </span>
              </div>

              {/* BALANCE */}
              <div style={{ marginBottom: "14px" }}>
                <p
                  style={{
                    fontSize: "30px",
                    fontWeight: "800",
                    margin: "6px 0",
                  }}
                >
                  ₹{acc.balance}
                </p>
                <small style={{ color: "#6b7280" }}>
                  Available Balance
                </small>
              </div>

              {/* ACTION */}
              {acc.status === "Active" && (
                <button
                  onClick={() => handleCloseAccount(acc.id)}
                  style={{
                    width: "100%",
                    background:
                      "linear-gradient(135deg, #ef4444, #dc2626)",
                    color: "white",
                    border: "none",
                    padding: "10px",
                    borderRadius: "12px",
                    fontWeight: "700",
                    cursor: "pointer",
                    boxShadow: "0 10px 20px rgba(239,68,68,0.35)",
                  }}
                >
                  ❌ Close Account
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );

 case "Transactions":
  return (
    <>
      {/* ================= HEADER ================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "26px", fontWeight: "800" }}>
            💳 Transactions
          </h2>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            All your recent credits & debits
          </p>
        </div>

        <span
          style={{
            background: "#111827",
            color: "white",
            padding: "8px 14px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: "700",
          }}
        >
          {transactions.length} Records
        </span>
      </div>

      {/* ================= EMPTY STATE ================= */}
      {transactions.length === 0 ? (
        <div
          style={{
            background: "rgba(255,255,255,0.95)",
            borderRadius: "18px",
            padding: "30px",
            textAlign: "center",
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)",
          }}
        >
          <h3 style={{ marginBottom: "6px" }}>😕 No transactions yet</h3>
          <p style={{ color: "#6b7280" }}>
            Start transferring or spending to see activity
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "12px",
          }}
        >
          {transactions.map((t, i) => {
            const isDebit = t.type === "debit" || t.amount < 0;

            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile
  ? "1fr"
  : "50px 1fr auto"
,
                  alignItems: "center",
                  gap: "14px",
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))",
                  backdropFilter: "blur(10px)",
                  padding: "16px 18px",
                  borderRadius: "18px",
                  boxShadow: "0 18px 35px rgba(0,0,0,0.08)",
                  borderLeft: isDebit
                    ? "6px solid #dc2626"
                    : "6px solid #16a34a",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-4px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                {/* ICON */}
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: isDebit
                      ? "rgba(220,38,38,0.15)"
                      : "rgba(22,163,74,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                  }}
                >
                  {isDebit ? "⬇️" : "⬆️"}
                </div>

                {/* DETAILS */}
                <div>
                  <p style={{ fontWeight: "700", marginBottom: "4px" }}>
                    {t.message || "Money Transfer"}
                  </p>

                  <small style={{ color: "#6b7280" }}>
                    TXN{i + 1001} • {isDebit ? "Debit" : "Credit"}
                  </small>
                </div>

                {/* AMOUNT */}
                <div style={{ textAlign: "right" }}>
                  <p
                    style={{
                      fontSize: "20px",
                      fontWeight: "800",
                      color: isDebit ? "#dc2626" : "#16a34a",
                    }}
                  >
                    {isDebit ? "-" : "+"}₹{Math.abs(t.amount)}
                  </p>

                  <small style={{ color: "#6b7280" }}>
                    Completed
                  </small>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );

case "Transfer Money":
  const inputBaseStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    outline: "none",
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "26px", fontWeight: "800" }}>
            💸 Transfer Money
          </h2>
          <p style={{ color: "#6b7280", fontSize: "14px" }}>
            Fast • Secure • Instant
          </p>
        </div>

        <span
          style={{
            background: "linear-gradient(135deg, #16a34a, #22c55e)",
            color: "white",
            padding: "8px 14px",
            borderRadius: "999px",
            fontSize: "13px",
            fontWeight: "700",
            boxShadow: "0 6px 14px rgba(34,197,94,0.35)",
          }}
        >
          🔒 Bank Secured
        </span>
      </div>

      {/* ================= TRANSFER CARD ================= */}
      <div
        style={{
          maxWidth: isMobile ? "100%" : "460px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.88))",
          backdropFilter: "blur(14px)",
          padding: "22px",
          borderRadius: "22px",
          boxShadow: "0 25px 50px rgba(0,0,0,0.12)",
          borderLeft: "6px solid #2563eb",
        }}
      >
        {/* ================= RECIPIENT ================= */}
        <label style={{ fontWeight: "600", fontSize: "14px" }}>
          👤 Recipient User ID
        </label>
        <input
          value={transferTo}
          onChange={(e) => setTransferTo(e.target.value)}
          placeholder="Enter recipient user ID"
          style={{
            ...inputBaseStyle,
            marginTop: "6px",
            marginBottom: "14px",
          }}
        />

        {/* ================= AMOUNT ================= */}
        <label style={{ fontWeight: "600", fontSize: "14px" }}>
          💰 Amount
        </label>
        <div style={{ position: "relative", marginBottom: "14px" }}>
          <span
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              fontWeight: "700",
              color: "#2563eb",
              pointerEvents: "none",
            }}
          >
            ₹
          </span>

          <input
            type="number"
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            placeholder="0.00"
            style={{
              ...inputBaseStyle,
              paddingLeft: "36px", // 👈 keeps width equal
              fontWeight: "600",
              fontSize: "16px",
            }}
          />
        </div>

        {/* ================= NOTE ================= */}
        <label style={{ fontWeight: "600", fontSize: "14px" }}>
          📝 Note (optional)
        </label>
        <input
          value={transferMessage}
          onChange={(e) => setTransferMessage(e.target.value)}
          placeholder="Rent • Food • Loan • Gift"
          style={{
            ...inputBaseStyle,
            marginTop: "6px",
            marginBottom: "18px",
            fontSize: "14px",
          }}
        />

        {/* ================= TRANSFER BUTTON ================= */}
        <button
          onClick={handleTransfer}
          style={{
            width: "100%",
            background: "linear-gradient(135deg, #2563eb, #1e40af)",
            color: "white",
            padding: "14px",
            border: "none",
            borderRadius: "14px",
            fontSize: "16px",
            fontWeight: "800",
            cursor: "pointer",
            boxShadow: "0 10px 25px rgba(37,99,235,0.4)",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "translateY(-2px)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.transform = "translateY(0)")
          }
        >
          🚀 Transfer Instantly
        </button>

        {/* ================= STATUS ================= */}
        {transferStatus && (
          <div
            style={{
              marginTop: "14px",
              padding: "10px",
              borderRadius: "10px",
              fontWeight: "600",
              background: transferStatus.includes("✅")
                ? "#dcfce7"
                : "#fee2e2",
              color: transferStatus.includes("✅")
                ? "#166534"
                : "#991b1b",
              textAlign: "center",
            }}
          >
            {transferStatus}
          </div>
        )}
      </div>
    </>
  );

case "Currency Exchange": {
  const fieldStyle = {
    width: "100%",
    height: "48px",              // ✅ SAME HEIGHT
    padding: "0 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "15px",
    fontWeight: "600",
    boxSizing: "border-box",
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <div style={{ marginBottom: "18px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "900" }}>
          💱 Currency Exchange
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Real-time • Secure • Instant conversion
        </p>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
  ? "1fr"
  : "1.1fr 0.9fr"
,
          gap: "28px",
          alignItems: "stretch",
        }}
      >
        {/* ================= INPUT PANEL ================= */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.88))",
            backdropFilter: "blur(14px)",
            borderRadius: "22px",
            padding: "22px",
            boxShadow: "0 25px 45px rgba(0,0,0,0.1)",
            borderLeft: "6px solid #2563eb",
          }}
        >
          <h3 style={{ fontSize: "18px", fontWeight: "800", marginBottom: "18px" }}>
            🔄 Convert Currency
          </h3>

          {/* FROM */}
          <label style={{ fontWeight: "600", fontSize: "14px" }}>From</label>
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            style={{ ...fieldStyle, marginTop: "6px", marginBottom: "14px" }}
          >
            <option value="INR">🇮🇳 INR</option>
            <option value="USD">🇺🇸 USD</option>
          </select>

          {/* TO */}
          <label style={{ fontWeight: "600", fontSize: "14px" }}>To</label>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            style={{ ...fieldStyle, marginTop: "6px", marginBottom: "14px" }}
          >
            <option value="USD">🇺🇸 USD</option>
            <option value="INR">🇮🇳 INR</option>
          </select>

          {/* AMOUNT */}
          <label style={{ fontWeight: "600", fontSize: "14px" }}>Amount</label>
          <div style={{ position: "relative", marginTop: "6px" }}>
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                fontWeight: "800",
                color: "#2563eb",
                fontSize: "16px",
              }}
            >
              {fromCurrency === "INR" ? "₹" : "$"}
            </span>

            <input
              type="number"
              value={exchangeAmount}
              onChange={(e) => setExchangeAmount(Number(e.target.value))}
              placeholder="Enter amount"
              style={{
                ...fieldStyle,
                paddingLeft: "36px", // space for currency symbol
                fontWeight: "700",
              }}
            />
          </div>

          {/* INFO STRIP */}
          <div
            style={{
              marginTop: "16px",
              padding: "10px",
              borderRadius: "12px",
              background: "#eff6ff",
              color: "#1e40af",
              fontSize: "13px",
              fontWeight: "600",
              textAlign: "center",
            }}
          >
            💡 Rates updated every few seconds
          </div>
        </div>

        {/* ================= RESULT PANEL ================= */}
        <div
          style={{
            background: "linear-gradient(135deg, #2563eb, #1e3a8a)",
            color: "white",
            borderRadius: "26px",
            padding: "28px",
            textAlign: "center",
            boxShadow: "0 30px 60px rgba(37,99,235,0.45)",
            position: "relative",
            overflowX: 'hidden',
overflowY: 'auto'

          }}
        >
          {/* GLOW */}
          <div
            style={{
              position: "absolute",
              top: "-80px",
              right: "-80px",
              width: "220px",
              height: "220px",
              background: "rgba(255,255,255,0.18)",
              borderRadius: "50%",
            }}
          />

          <p style={{ opacity: 0.85, fontSize: "14px", fontWeight: "600" }}>
            Converted Amount
          </p>

          <h1
            style={{
              fontSize: "46px",
              fontWeight: "900",
              margin: "16px 0",
              letterSpacing: "1px",
            }}
          >
            {toCurrency === "INR" ? "₹" : "$"}
            {convertedAmount}
          </h1>

          <p style={{ fontSize: "13px", opacity: 0.85 }}>
            💹 Live Exchange Rate Applied
          </p>

          <div
            style={{
              marginTop: "18px",
              display: "inline-block",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.18)",
              fontSize: "13px",
              fontWeight: "700",
            }}
          >
            1 {fromCurrency} ≈ {exchangeRate} {toCurrency}
          </div>
        </div>
      </div>
    </>
  );
}

case "Rewards":
  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    alert("✅ Coupon copied to clipboard");
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <div style={{ marginBottom: "22px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "900" }}>
          🎁 Rewards & Insights
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Earn • Redeem • Save more every day
        </p>
      </div>

      {/* ================= INSIGHTS ================= */}
      {rewardInsights && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "18px",
            marginBottom: "28px",
          }}
        >
          {[
            {
              title: "Total Earned",
              value: `₹${rewardInsights.total_earned}`,
              icon: "💰",
              color: "#16a34a",
            },
            {
              title: "Redeemed",
              value: `₹${rewardInsights.total_redeemed}`,
              icon: "🔁",
              color: "#2563eb",
            },
            {
              title: "Available",
              value: `₹${rewardInsights.available}`,
              icon: "🏦",
              color: "#9333ea",
            },
            {
              title: "Coupons",
              value: rewardInsights.coupon_rewards,
              icon: "🎟️",
              color: "#f59e0b",
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                ...cardStyle,
                borderLeft: `6px solid ${item.color}`,
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "12px",
                  right: "12px",
                  fontSize: "26px",
                  opacity: 0.25,
                }}
              >
                {item.icon}
              </div>

              <p style={{ fontSize: "14px", color: "#6b7280" }}>
                {item.title}
              </p>
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "800",
                  color: item.color,
                }}
              >
                {item.value}
              </h2>
            </div>
          ))}
        </div>
      )}

      {/* ================= REWARDS LIST ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "22px",
        }}
      >
        {!rewards || !Array.isArray(rewards.offers) ? (
          <div style={{ ...cardStyle, textAlign: "center", color: "#6b7280" }}>
            ⏳ Loading rewards...
          </div>
        ) : rewards.offers.length === 0 ? (
          <div style={{ ...cardStyle, textAlign: "center", color: "#6b7280" }}>
            😕 No rewards available yet
          </div>
        ) : (
          rewards.offers.map((r) => (
            <div
              key={r.id}
              style={{
                ...cardStyle,
                borderLeft:
                  r.type === "cash"
                    ? "6px solid #16a34a"
                    : "6px solid #9333ea",
              }}
            >
              {/* TITLE */}
              <h3 style={{ marginBottom: "6px" }}>
                {r.type === "cash" ? "💰 Cashback Reward" : "🎟️ Coupon Reward"}
              </h3>

              <p style={{ fontWeight: "600", marginBottom: "10px" }}>
                {r.title}
              </p>

              {/* ================= CASHBACK ================= */}
              {r.type === "cash" && (
                <>
                  <h2
                    style={{
                      fontSize: "28px",
                      fontWeight: "900",
                      color: "#16a34a",
                    }}
                  >
                    ₹{r.amount}
                  </h2>

                  <button
                    disabled={r.is_redeemed}
                    onClick={async () => {
                      await handleRedeem(r.amount);

                      // refresh rewards + dashboard
                      const res = await api.get(`/rewards/${userId}`);
                      setRewards(res.data);
                    }}
                    style={{
                      width: "100%",
                      marginTop: "14px",
                      background: r.is_redeemed
                        ? "#9ca3af"
                        : "linear-gradient(135deg, #16a34a, #22c55e)",
                      color: "white",
                      border: "none",
                      padding: "12px",
                      borderRadius: "12px",
                      fontWeight: "800",
                      cursor: r.is_redeemed ? "not-allowed" : "pointer",
                      boxShadow: r.is_redeemed
                        ? "none"
                        : "0 10px 22px rgba(34,197,94,0.35)",
                    }}
                  >
                    {r.is_redeemed ? "✅ Redeemed" : "Redeem to Bank"}
                  </button>
                </>
              )}

              {/* ================= COUPON ================= */}
              {r.type === "coupon" && (
                <>
                  <div
                    style={{
                      marginTop: "14px",
                      padding: "14px",
                      borderRadius: "12px",
                      background: "#f3f4f6",
                      fontWeight: "900",
                      fontSize: "16px",
                      textAlign: "center",
                      letterSpacing: "1.5px",
                    }}
                  >
                    {r.coupon}
                  </div>

                  <button
                    onClick={() => handleCopyCoupon(r.coupon)}
                    style={{
                      marginTop: "12px",
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #9333ea, #7e22ce)",
                      color: "white",
                      border: "none",
                      fontWeight: "800",
                      cursor: "pointer",
                      boxShadow: "0 8px 18px rgba(147,51,234,0.35)",
                    }}
                  >
                    📋 Copy Coupon
                  </button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );

case "Bills & Reminders":
  const inputStyle = {
    width: "100%",
    height: "48px",
    padding: "0 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    fontWeight: "500",
    outline: "none",
    boxSizing: "border-box",
    background: "white",
  };

  const labelStyle = {
    fontWeight: "700",
    fontSize: "12px",
    marginBottom: "6px",
    display: "block",
    color: "#374151",
  };

  return (
    <>
      {/* HEADER */}
      <div style={{ marginBottom: "22px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "900" }}>
          🧾 Bills & Reminders
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Track • Pay • Stay Organized
        </p>
      </div>

      {/* MAIN GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
  ? "1fr"
  : "420px 1fr"
,
          gap: "26px",
          alignItems: "start",
        }}
      >
        {/* ADD BILL */}
        <div
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.98), rgba(255,255,255,0.92))",
            borderRadius: "22px",
            padding: "22px",
            boxShadow: "0 18px 36px rgba(0,0,0,0.12)",
            borderLeft: "6px solid #2563eb",
          }}
        >
          <h3
            style={{
              fontWeight: "800",
              marginBottom: "18px",
              fontSize: "18px",
            }}
          >
            ➕ Add New Bill
          </h3>

          {/* BILL NAME */}
          <label style={labelStyle}>Bill Name</label>
          <input
            type="text"
            value={billTitle}
            onChange={(e) => setBillTitle(e.target.value)}
            placeholder="Electricity, Rent, Internet"
            style={{ ...inputStyle, marginBottom: "14px" }}
          />

          {/* AMOUNT */}
          <label style={labelStyle}>Amount</label>
          <div style={{ position: "relative", marginBottom: "14px" }}>
            <span
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                fontWeight: "800",
                color: "#2563eb",
              }}
            >
              ₹
            </span>
            <input
              type="number"
              value={billAmount}
              onChange={(e) => setBillAmount(e.target.value)}
              placeholder="0.00"
              style={{ ...inputStyle, paddingLeft: "34px" }}
            />
          </div>

          {/* DUE DATE (TEXT INPUT – SAME SIZE GUARANTEED) */}
          <label style={labelStyle}>Due Date</label>
          <input
            type="text"
            value={billDueDate}
            onChange={(e) => setBillDueDate(e.target.value)}
            placeholder="YYYY-MM-DD"
            style={{ ...inputStyle, marginBottom: "18px" }}
          />

          {/* SAVE BUTTON */}
          <button
            onClick={handleAddBill}
            style={{
              width: "100%",
              height: "48px",
              background: "linear-gradient(135deg, #2563eb, #1e40af)",
              color: "white",
              border: "none",
              borderRadius: "14px",
              fontSize: "15px",
              fontWeight: "800",
              cursor: "pointer",
              boxShadow: "0 10px 22px rgba(37,99,235,0.45)",
            }}
          >
            💾 Save Bill
          </button>

          {/* STATUS */}
          {billStatus && (
            <div
              style={{
                marginTop: "14px",
                padding: "10px",
                borderRadius: "10px",
                textAlign: "center",
                fontWeight: "700",
                fontSize: "13px",
                background: billStatus.includes("✅")
                  ? "#dcfce7"
                  : "#fee2e2",
                color: billStatus.includes("✅")
                  ? "#166534"
                  : "#991b1b",
              }}
            >
              {billStatus}
            </div>
          )}
        </div>

        {/* BILL LIST */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "18px",
          }}
        >
          {bills.length === 0 ? (
            <div style={{ ...cardStyle, textAlign: "center", color: "#6b7280" }}>
              😕 No bills yet <br /> Add one to get started
            </div>
          ) : (
            bills.map((bill) => (
              <div
                key={bill.id}
                style={{
                  ...cardStyle,
                  borderLeft: bill.is_paid
                    ? "6px solid #16a34a"
                    : "6px solid #f59e0b",
                }}
              >
                <h4 style={{ marginBottom: "6px", fontWeight: "800" }}>
                  {bill.is_paid ? "✅" : "⏳"} {bill.title}
                </h4>

                <p style={{ fontSize: "22px", fontWeight: "900" }}>
                  ₹{bill.amount}
                </p>

                <p style={{ fontSize: "13px", color: "#6b7280" }}>
                  Due: {bill.due_date}
                </p>

                {!bill.is_paid ? (
                  <button
                    onClick={() => handlePayBill(bill.id)}
                    style={{
                      marginTop: "12px",
                      width: "100%",
                      height: "42px",
                      background:
                        "linear-gradient(135deg, #16a34a, #22c55e)",
                      color: "white",
                      border: "none",
                      borderRadius: "10px",
                      fontWeight: "800",
                      cursor: "pointer",
                    }}
                  >
                    ✔ Mark as Paid
                  </button>
                ) : (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "8px",
                      borderRadius: "10px",
                      background: "#dcfce7",
                      color: "#166534",
                      fontWeight: "800",
                      textAlign: "center",
                      fontSize: "13px",
                    }}
                  >
                    Paid
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );


case "Settings":
  const settingsInputStyle = {
    width: "100%",
    height: "44px",
    padding: "0 14px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  };
  

  return (
    <>
      {/* ================= HEADER ================= */}
      <div style={{ marginBottom: "18px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "900" }}>
          ⚙️ Profile & Settings
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>
          Manage your identity, security & verification
        </p>
      </div>

      {/* ================= KYC ALERT ================= */}
      {settings?.kyc_status === "unverified" && (
        <div
          style={{
            marginBottom: "18px",
            padding: "14px",
            borderRadius: "14px",
            background: "linear-gradient(135deg,#fef3c7,#fde68a)",
            color: "#92400e",
            fontWeight: "800",
            fontSize: "14px",
          }}
        >
          ⚠️ Complete KYC to unlock full banking features
        </div>
      )}

      {settings && (
        <div
          style={{
            maxWidth: "980px",
            display: "grid",
            gridTemplateColumns: isMobile
  ? "1fr"
  : "1.15fr 0.85fr"
,
            gap: "22px",
            alignItems: "stretch",
          }}
        >
          {/* ================= LEFT : PROFILE ================= */}
          <div
            style={{
              background: "white",
              borderRadius: "18px",
              padding: "20px",
              boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
              borderLeft: "6px solid #2563eb",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <h3 style={{ fontWeight: "900", marginBottom: "14px" }}>
                👤 Profile Overview
              </h3>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                  gap: "14px",
                  fontSize: "14px",
                }}
              >
                <div>
                  <small style={{ color: "#6b7280" }}>Name</small>
                  <p style={{ fontWeight: "800" }}>{settings.name}</p>
                </div>

                <div>
                  <small style={{ color: "#6b7280" }}>Email</small>
                  <p style={{ fontWeight: "800" }}>{settings.email}</p>
                </div>

                <div>
                  <small style={{ color: "#6b7280" }}>Phone</small>
                  <p style={{ fontWeight: "800" }}>
                    {settings.phone || "—"}
                  </p>
                </div>

                <div>
                  <small style={{ color: "#6b7280" }}>KYC Status</small>
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        marginTop: "6px",
                        padding: "6px 14px",
                        borderRadius: "999px",
                        fontSize: "12px",
                        fontWeight: "800",
                        background:
                          settings.kyc_status === "verified"
                            ? "#dcfce7"
                            : "#fef3c7",
                        color:
                          settings.kyc_status === "verified"
                            ? "#166534"
                            : "#92400e",
                      }}
                    >
                      {settings.kyc_status === "verified"
                        ? "VERIFIED"
                        : "UNVERIFIED"}
                    </span>
                  </div>
                </div>
              </div>

              <p
                style={{
                  fontSize: "12px",
                  color: "#6b7280",
                  marginTop: "10px",
                }}
              >
                KYC verification ensures account security and compliance.
              </p>

              {settings.kyc_status === "unverified" && (
                <button
                  onClick={handleVerifyKYC}
                  style={{
                    marginTop: "16px",
                    width: "100%",
                    height: "46px",
                    background:
                      "linear-gradient(135deg,#2563eb,#1e40af)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: "900",
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(37,99,235,0.4)",
                  }}
                >
                  🧾 Verify KYC
                </button>
              )}
            </div>

            {/* FOOTER */}
            <div
              style={{
                marginTop: "18px",
                paddingTop: "12px",
                borderTop: "1px dashed #e5e7eb",
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              Account created on{" "}
              <strong>
                {new Date(settings.created_at).toLocaleDateString()}
              </strong>
            </div>
          </div>

          {/* ================= RIGHT : ACTIONS ================= */}
          <div
            style={{
              background: "white",
              borderRadius: "18px",
              padding: "20px",
              boxShadow: "0 12px 30px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "18px",
            }}
          >
            {/* -------- PROFILE ACTIONS -------- */}
            <div>
              <h4 style={{ fontWeight: "900", marginBottom: "8px" }}>
                ✏️ Profile Actions
              </h4>

              <button
                onClick={() => setShowEditProfile((p) => !p)}
                style={{
                  width: "100%",
                  height: "42px",
                  background: "#2563eb",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "800",
                  cursor: "pointer",
                }}
              >
                Edit Profile
              </button>

              {showEditProfile && (
                <div style={{ marginTop: "10px" }}>
                  <input
                    placeholder="Full Name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ ...settingsInputStyle, marginBottom: "8px" }}
                  />
                  <input
                    placeholder="Phone Number"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    style={{ ...settingsInputStyle, marginBottom: "8px" }}
                  />
                  <button
                    onClick={handleEditProfile}
                    style={{
                      width: "100%",
                      height: "42px",
                      background:
                        "linear-gradient(135deg,#16a34a,#22c55e)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      fontWeight: "900",
                      cursor: "pointer",
                    }}
                  >
                    💾 Save Changes
                  </button>
                </div>
              )}
            </div>

            {/* -------- SECURITY -------- */}
            <div>
              <h4 style={{ fontWeight: "900", marginBottom: "8px" }}>
                🔐 Security
              </h4>

              <button
                onClick={() => setShowChangePassword((p) => !p)}
                style={{
                  width: "100%",
                  height: "42px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: "800",
                  cursor: "pointer",
                }}
              >
                Change Password
              </button>

              {showChangePassword && (
                <div style={{ marginTop: "10px" }}>
                  <input
                    type="password"
                    placeholder="Old Password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    style={{ ...settingsInputStyle, marginBottom: "8px" }}
                  />
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={{ ...settingsInputStyle, marginBottom: "8px" }}
                  />
                  <button
                    onClick={handleChangePassword}
                    style={{
                      width: "100%",
                      height: "42px",
                      background: "#111827",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      fontWeight: "900",
                      cursor: "pointer",
                    }}
                  >
                    🔁 Update Password
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= STATUS MESSAGE ================= */}
      {settingsStatus && (
        <div
          style={{
            marginTop: "18px",
            padding: "12px",
            borderRadius: "12px",
            textAlign: "center",
            fontWeight: "900",
            background: settingsStatus.includes("✅")
              ? "#dcfce7"
              : "#fee2e2",
            color: settingsStatus.includes("✅")
              ? "#166534"
              : "#991b1b",
          }}
        >
          {settingsStatus}
        </div>
      )}
    </>
  );

      default:
        return null;
    }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
     <div
  style={{
    height: "60px",
    background: "#1f2937",
    color: "white",
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: isMobile ? "8px 12px" : "0 20px",
    gap: isMobile ? "6px" : "0",
  }}
>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
  <button
    onClick={() => setIsSidebarOpen(prev => !prev)}
    style={{
      background: "transparent",
      border: "none",
      color: "white",
      fontSize: "22px",
      cursor: "pointer"
    }}
  >
    ☰
  </button>

  <h3>🏦 Shreyas Bank</h3>
</div>

<button
  onClick={onLogout}
  style={{
    background: "#ef4444",   // red
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer"
  }}
>
  Logout
</button>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
       <div
  style={{
    position: isMobile ? "fixed" : "relative",
    zIndex: 1000,
    height: "100%",
    left: isMobile && !isSidebarOpen ? "-260px" : "0",
    width: isSidebarOpen ? "240px" : "70px",
    background: "#111827",
    color: "white",
    padding: "20px",
    transition: "all 0.3s ease",
    overflowY: "auto",
  }}
>


          {[
 "Dashboard",
 "Accounts",
 "Transactions",
 "Transfer Money",
 "Currency Exchange",
 "Rewards",
 "Bills & Reminders",   // ✅ ADD
 "Settings"
]

.map(item => (
  <div
    key={item}
    onClick={() => {
  setActivePage(item);
  if (isMobile) setIsSidebarOpen(false);
}}

    style={{
      padding: "12px",
      marginBottom: "10px",
      cursor: "pointer",
      borderRadius: "8px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      background: activePage === item ? "#374151" : "transparent",
      transition: "background 0.2s"
    }}
  >
    {/* ICON (always visible) */}
    <span style={{ fontSize: "18px" }}>
      {sidebarIcons[item]}
    </span>

    {/* TEXT (only when sidebar is open) */}
    {isSidebarOpen && (
      <span style={{ whiteSpace: "nowrap" }}>
        {item}
      </span>
    )}
  </div>
))}

        </div>

        <div
  style={{
    flex: 1,
    padding: isMobile ? "16px" : "30px",
    background: "#f3f4f6",
    marginLeft: isMobile ? "0" : undefined,
  }}
>
  {renderContent()}
</div>

      </div>
    </div>
  );
}

// ✅ PLACE THIS AT THE TOP (before AdminDashboard)

const PremiumStatCard = ({ title, value, icon, gradient }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.95)",
      backdropFilter: "blur(14px)",
      borderRadius: "20px",
      padding: "22px",
      boxShadow: "0 25px 45px rgba(0,0,0,0.12)",
      position: "relative",
      overflowX: 'hidden',
overflowY: 'auto',

      transition: "transform 0.25s ease, box-shadow 0.25s ease"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-6px)";
      e.currentTarget.style.boxShadow =
        "0 30px 60px rgba(0,0,0,0.18)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow =
        "0 25px 45px rgba(0,0,0,0.12)";
    }}
  >
    {/* Gradient strip */}
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "6px",
        background: gradient
      }}
    />

    <div style={{ fontSize: "32px", marginBottom: "10px" }}>
      {icon}
    </div>

    <p style={{ fontSize: "14px", color: "#6b7280" }}>
      {title}
    </p>

    <h2 style={{ fontSize: "32px", fontWeight: "900" }}>
      {value ?? "—"}
    </h2>
  </div>
);


function AdminDashboard({ onLogout }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("Dashboard");

  const [summary, setSummary] = useState({});
  const [users, setUsers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [txnSearch, setTxnSearch] = useState("");
  const [lookupUserId, setLookupUserId] = useState("");
const [accountDetails, setAccountDetails] = useState(null);
const [lookupError, setLookupError] = useState("");
const [kycUsers, setKycUsers] = useState([]);
const [kycFilter, setKycFilter] = useState("all");
const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

useEffect(() => {
  const handleResize = () => setIsMobile(window.innerWidth < 768);
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

  useEffect(() => {
  if (activePage === "Dashboard") loadSummary();
  if (activePage === "Users") loadUsers();
  if (activePage === "Transactions") loadTransactions();
  if (activePage === "KYCStatus") loadKYC();   // ✅
}, [activePage]);



  const loadSummary = async () => {
    const res = await api.get("/admin/summary");
    setSummary(res.data);
  };

  const loadUsers = async () => {
    const res = await api.get("/admin/users");
    setUsers(res.data);
  };
const loadKYC = async () => {
  const res = await api.get("/admin/kyc");
  setKycUsers(res.data);
};

  const loadTransactions = async () => {
    const res = await api.get("/admin/transactions");
    setTransactions(res.data);
  };

  const toggleUserStatus = async (id) => {
    await api.put(`/admin/user/${id}/status`);
    loadUsers();
  };
const filteredKYC = kycUsers.filter(u =>
  u.role !== "admin" &&
  (kycFilter === "all" ? true : u.kyc_status === kycFilter)
);

  const filteredTransactions = transactions.filter(t =>
    txnSearch === "" ||
    String(t.sender_id ?? "").includes(txnSearch) ||
    String(t.receiver_id ?? "").includes(txnSearch)
  );

  const sidebarItems = {
  Dashboard: "📊",
  Users: "👥",
  Accounts: "🏦",
  Transactions: "💳",
  KYCStatus: "🧾"
     // ✅ NEW
};
const fetchAccountDetails = async () => {
  if (!lookupUserId) return;

  try {
    setLookupError("");
    const res = await api.get(`/admin/account-details/${lookupUserId}`);
    setAccountDetails(res.data);
  } catch (err) {
    setAccountDetails(null);
    setLookupError("❌ User not found or no accounts available");
  }
};
const exportTransactionsCSV = () => {
  if (!filteredTransactions || filteredTransactions.length === 0) {
    alert("No transactions to export");
    return;
  }

  const headers = [
    "Transaction ID",
    "Sender ID",
    "Receiver ID",
    "Amount",
    "Message"
  ];

  const rows = filteredTransactions.map(t => [
    t.id,
    t.sender_id ?? "System",
    t.receiver_id,
    t.amount,
    t.message || ""
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers, ...rows]
      .map(row => row.map(v => `"${v}"`).join(","))
      .join("\n");

  const encodedUri = encodeURI(csvContent);

  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `transactions_${new Date().toISOString().slice(0, 10)}.csv`
  );

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  return (
    <div style={styles.app}>
      {/* ================= TOP BAR ================= */}
      <div style={styles.topBar}>
        <div style={styles.topLeft}>
          <button onClick={() => setIsSidebarOpen(p => !p)} style={styles.menuBtn}>☰</button>
          <h3 style={styles.brand}>🏦 Shreyas Bank</h3>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn}>Logout</button>
      </div>

      <div style={styles.body}>
        {/* ================= SIDEBAR ================= */}
        <div
  style={{
    ...styles.sidebar,
    position: isMobile ? "fixed" : "relative",
    zIndex: 1000,
    height: "100%",
    left: isMobile && !isSidebarOpen ? "-260px" : "0",
    width: isSidebarOpen ? 230 : 70,
    transition: "all 0.3s ease",
  }}
>

          {Object.keys(sidebarItems).map(item => (
            <div
              key={item}
              onClick={() => {
  setActivePage(item);
  if (isMobile) setIsSidebarOpen(false);
}}

              style={{
                ...styles.sideItem,
                background: activePage === item ? "#1f2937" : "transparent"
              }}
            >
              <span style={{ fontSize: 20 }}>{sidebarItems[item]}</span>
              {isSidebarOpen && <span>{item}</span>}
            </div>
          ))}
        </div>

        {/* ================= CONTENT ================= */}
        <div style={styles.content}>
          {/* ================= DASHBOARD ================= */}
         {activePage === "Dashboard" && (
  <>
    {/* ===== HERO HEADER ===== */}
    <div
      style={{
        background: "linear-gradient(135deg, #2563eb, #1e40af)",
        color: "white",
        padding: "26px 30px",
        borderRadius: "22px",
        marginBottom: "28px",
        boxShadow: "0 30px 60px rgba(37,99,235,0.45)",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Glow */}
      <div
        style={{
          position: "absolute",
          top: "-80px",
          right: "-80px",
          width: "220px",
          height: "220px",
          background: "rgba(255,255,255,0.15)",
          borderRadius: "50%"
        }}
      />

      <h2 style={{ fontSize: "30px", fontWeight: "900", marginBottom: "6px" }}>
        📊 Admin Dashboard
      </h2>
      <p style={{ opacity: 0.9, fontSize: "14px" }}>
        Real-time insights & system overview
      </p>
    </div>

    {/* ===== STATS GRID ===== */}
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "22px"
      }}
    >
      <PremiumStatCard
        title="Total Users"
        value={summary.total_users}
        icon="👥"
        gradient="linear-gradient(135deg, #22c55e, #16a34a)"
      />

      <PremiumStatCard
        title="Active Users"
        value={summary.active_users}
        icon="🟢"
        gradient="linear-gradient(135deg, #38bdf8, #2563eb)"
      />

      <PremiumStatCard
        title="Admins"
        value={summary.admin_users}
        icon="🛡️"
        gradient="linear-gradient(135deg, #a855f7, #7e22ce)"
      />

      <PremiumStatCard
        title="Transactions"
        value={summary.total_transactions}
        icon="💳"
        gradient="linear-gradient(135deg, #f59e0b, #d97706)"
      />
    </div>
  </>
)}



          {/* ================= USERS ================= */}
          {activePage === "Users" && (
            <>
              <h2 style={styles.pageTitle}>👥 User Management</h2>
              <div style={{ overflowX: "auto" }}>
  <table style={{ ...styles.table, minWidth: "700px" }}>
                  <thead>
                    <tr>
                      {["ID", "Name", "Email", "Role", "Status", "Action"].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td style={styles.td}>{u.id}</td>
                        <td style={styles.td}>{u.name}</td>
                        <td style={styles.td}>{u.email}</td>
                        <td style={styles.td}>{u.role}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.badge,
                            background: u.is_active ? "#dcfce7" : "#fee2e2",
                            color: u.is_active ? "#166534" : "#991b1b"
                          }}>
                            {u.is_active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={styles.td}>
                          <button
                            onClick={() => toggleUserStatus(u.id)}
                            style={{
                              ...styles.actionBtn,
                              background: u.is_active ? "#ef4444" : "#16a34a"
                            }}
                          >
                            {u.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ================= TRANSACTIONS ================= */}
          {activePage === "Transactions" && (
            <>
              <h2 style={styles.pageTitle}>💳 Transactions</h2>

              <div style={styles.searchWrap}>
                
              </div>

              <div style={{ overflowX: "auto" }}>
                <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px",
    marginBottom: "14px",
  }}
>
  {/* SEARCH BAR */}
  <input
    type="text"
    placeholder="🔍 Search by User ID (Sender / Receiver)"
    value={txnSearch}
    onChange={(e) => setTxnSearch(e.target.value)}
    style={styles.searchInput}
  />

  {/* EXPORT BUTTON */}
  <button
    onClick={exportTransactionsCSV}
    style={{
      background: "linear-gradient(135deg, #16a34a, #22c55e)",
      color: "white",
      padding: "10px 18px",
      borderRadius: "999px",
      border: "none",
      fontWeight: "900",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      boxShadow: "0 10px 25px rgba(34,197,94,0.45)",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow =
        "0 16px 35px rgba(34,197,94,0.6)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow =
        "0 10px 25px rgba(34,197,94,0.45)";
    }}
  >
    📥 Export CSV
  </button>
</div>

  <table style={{ ...styles.table, minWidth: "700px" }}>
                  <thead>
                    <tr>
                      {["ID", "Sender", "Receiver", "Amount", "Message"].map(h => (
                        <th key={h} style={styles.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan="5" style={{ ...styles.td, textAlign: "center", color: "#6b7280" }}>
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map(t => (
                        <tr key={t.id}>
                          <td style={styles.td}>{t.id}</td>
                          <td style={styles.td}>{t.sender_id ?? "System"}</td>
                          <td style={styles.td}>{t.receiver_id}</td>
                          <td style={{
                            ...styles.td,
                            fontWeight: 800,
                            color: t.sender_id ? "#dc2626" : "#16a34a"
                          }}>
                            ₹{t.amount}
                          </td>
                          <td style={styles.td}>{t.message || "—"}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {activePage === "Accounts" && (
  <>
    <h2 style={pageTitle}>🏦 Accounts</h2>

    {/* 🔍 SEARCH BAR */}
    <div style={lookupCard}>
      <input
        type="number"
        placeholder="Enter User ID"
        value={lookupUserId}
        onChange={(e) => setLookupUserId(e.target.value)}
        style={searchInput}
      />
      <button onClick={fetchAccountDetails} style={searchBtn}>
        Search
      </button>
    </div>

    {lookupError && <p style={{ color: "#dc2626", fontWeight: 700 }}>{lookupError}</p>}

    {/* 👤 USER INFO */}
    {accountDetails && (
      <>
        <div style={infoGrid}>
          <InfoBox title="User ID" value={accountDetails.user.id} />
          <InfoBox title="Name" value={accountDetails.user.name} />
          <InfoBox title="Email" value={accountDetails.user.email} />
          <InfoBox
            title="Total Balance"
            value={`₹${accountDetails.total_balance}`}
            highlight
          />
        </div>

        {/* 🏦 ACCOUNTS TABLE */}
       <div style={{ overflowX: "auto" }}>
          <h3 style={{ marginBottom: "10px" }}>🏦 Accounts</h3>
         
  <table style={{ ...styles.table, minWidth: "700px" }}>
            <thead>
              <tr>
                <th style={th}>Account ID</th>
                <th style={th}>Type</th>
                <th style={th}>Balance</th>
                <th style={th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {accountDetails.accounts.map(acc => (
                <tr key={acc.id}>
                  <td style={td}>{acc.id}</td>
                  <td style={td}>{acc.type}</td>
                  <td style={{ ...td, fontWeight: 800 }}>₹{acc.balance}</td>
                  <td style={td}>
                    <span style={{
                      padding: "4px 10px",
                      borderRadius: "999px",
                      fontSize: "12px",
                      fontWeight: 700,
                      background: acc.status === "Active" ? "#dcfce7" : "#fee2e2",
                      color: acc.status === "Active" ? "#166534" : "#991b1b"
                    }}>
                      {acc.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    )}
    
  </>
)}
{activePage === "KYCStatus" && (
  <>
    <h2 style={styles.pageTitle}>🧾 KYC Overview</h2>

    {/* FILTER */}
    <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
      {["all", "verified", "unverified"].map(s => (
        <button
          key={s}
          onClick={() => setKycFilter(s)}
          style={{
            padding: "8px 16px",
            borderRadius: "999px",
            border: "none",
            fontWeight: 700,
            cursor: "pointer",
            background:
              kycFilter === s ? "#2563eb" : "#e5e7eb",
            color: kycFilter === s ? "white" : "#111827"
          }}
        >
          {s.toUpperCase()}
        </button>
      ))}
    </div>

    {/* TABLE */}
    <div style={{ overflowX: "auto" }}>
  <table style={{ ...styles.table, minWidth: "700px" }}>
        <thead>
          <tr>
            {["ID", "Name", "Email", "KYC Status", "Joined"].map(h => (
              <th key={h} style={styles.th}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredKYC.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "20px" }}>
                No users found
              </td>
            </tr>
          ) : (
            filteredKYC.map(u => (
              <tr key={u.id}>
                <td style={styles.td}>{u.id}</td>
                <td style={styles.td}>{u.name || "—"}</td>
                <td style={styles.td}>{u.email}</td>
                <td style={styles.td}>
                  <span style={{
                    padding: "5px 12px",
                    borderRadius: "999px",
                    fontWeight: 700,
                    fontSize: "12px",
                    background:
                      u.kyc_status === "verified"
                        ? "#dcfce7"
                        : u.kyc_status === "pending"
                        ? "#fef3c7"
                        : "#fee2e2",
                    color:
                      u.kyc_status === "verified"
                        ? "#166534"
                        : u.kyc_status === "pending"
                        ? "#92400e"
                        : "#991b1b"
                  }}>
                    {u.kyc_status.toUpperCase()}
                  </span>
                </td>
                <td style={styles.td}>
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </>
)}

        </div>
      </div>
    </div>
  );
  
}


/* ================= COMPONENTS ================= */
const StatCard = ({ title, value }) => (
  <div style={styles.statCard}>
    <p style={styles.statTitle}>{title}</p>
    <h2 style={styles.statValue}>{value ?? "—"}</h2>
  </div>
);

/* ================= STYLES ================= */
const styles = {
  app: { height: "100vh", background: "#f3f4f6", display: "flex", flexDirection: "column" },
  topBar: { height: 60, background: "#111827", color: "white", display: "flex", justifyContent: "space-between", padding: "0 20px", alignItems: "center" },
  topLeft: { display: "flex", alignItems: "center", gap: 12 },
  brand: { margin: 0, fontWeight: 800 },
  menuBtn: { background: "transparent", border: "none", color: "white", fontSize: 22, cursor: "pointer" },
  logoutBtn: { background: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: 8, fontWeight: 700 },
  body: { display: "flex", flex: 1 },
  sidebar: { background: "#020617", padding: 16, transition: "width 0.3s ease" },
  sideItem: { display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", borderRadius: 12, cursor: "pointer", color: "white", fontWeight: 600 },
  content: { flex: 1, padding: 30 },
  pageTitle: { fontSize: 28, fontWeight: 900, marginBottom: 20 },
  statsGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18 },
  statCard: { background: "white", padding: 20, borderRadius: 18, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" },
  statTitle: { fontSize: 14, color: "#6b7280" },
  statValue: { fontSize: 28, fontWeight: 900 },
  card: { background: "white", borderRadius: 18, padding: 20, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "12px 10px", borderBottom: "2px solid #e5e7eb", fontSize: 13 },
  td: { padding: "12px 10px", borderBottom: "1px solid #e5e7eb", fontSize: 14 },
  badge: { padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 800 },
  actionBtn: { color: "white", border: "none", padding: "6px 14px", borderRadius: 8, fontWeight: 700, cursor: "pointer" },
  searchWrap: { display: "flex", justifyContent: "flex-end", marginBottom: 14 },
  searchInput: { padding: "10px 14px", borderRadius: 12, border: "1px solid #d1d5db", width: 280 }
};







const lookupCard = {
  display: "flex",
  gap: "12px",
  marginBottom: "16px",
};

const searchInput = {
  flex: 1,
  padding: "12px",
  borderRadius: "12px",
  border: "1px solid #d1d5db",
  fontSize: "15px",
};

const searchBtn = {
  padding: "12px 20px",
  borderRadius: "12px",
  border: "none",
  background: "linear-gradient(135deg, #2563eb, #1e40af)",
  color: "white",
  fontWeight: "800",
  cursor: "pointer",
};

const infoGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "14px",
  marginBottom: "18px",
};

const InfoBox = ({ title, value, highlight }) => (
  <div
    style={{
      background: "white",
      padding: "14px",
      borderRadius: "14px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      borderTop: highlight ? "4px solid #16a34a" : "4px solid #2563eb",
    }}
  >
    <p style={{ fontSize: "13px", color: "#6b7280", margin: 0 }}>{title}</p>
    <h3 style={{ margin: 0, fontWeight: 900 }}>{value}</h3>
  </div>
);

/* ================= SMALL COMPONENT ================= */
const Stat = ({ title, value }) => (
  <div style={statCard}>
    <p style={{ margin: 0, fontSize: "13px", color: "#6b7280" }}>{title}</p>
    <h3 style={{ margin: "6px 0 0 0", fontSize: "24px", fontWeight: 900 }}>
      {value ?? 0}
    </h3>
  </div>
);

/* ================= STYLES ================= */
const topBar = {
  height: "56px",
  background: "#111827",
  color: "white",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 18px",
};

const menuBtn = {
  background: "transparent",
  border: "none",
  color: "white",
  fontSize: "22px",
  cursor: "pointer",
};

const logoutBtn = {
  background: "#ef4444",
  color: "white",
  border: "none",
  padding: "6px 12px",
  borderRadius: "8px",
  fontWeight: 700,
  cursor: "pointer",
};

const sideItem = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "10px",
  borderRadius: "8px",
  color: "white",
  cursor: "pointer",
  fontWeight: 700,
  marginBottom: "8px",
};

const content = {
  flex: 1,
  padding: "18px",
  background: "#f3f4f6",
};

const pageTitle = {
  margin: "0 0 10px 0",   // 🔥 THIS FIXES THE DELAY
  fontSize: "26px",
  fontWeight: 900,
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "12px",
};

const statCard = {
  background: "white",
  padding: "14px",
  borderRadius: "12px",
  boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
};

const tableCard = {
  background: "white",
  padding: "12px",
  borderRadius: "12px",
  boxShadow: "0 8px 18px rgba(0,0,0,0.06)",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px",
};

const th = {
  textAlign: "left",
  padding: "10px",
  background: "#f1f5f9",
  fontWeight: 800,
};

const td = {
  padding: "10px",
  borderBottom: "1px solid #e5e7eb",
  fontWeight: 600,
};

const actionBtn = {
  color: "white",
  border: "none",
  padding: "5px 10px",
  borderRadius: "8px",
  fontWeight: 700,
  cursor: "pointer",
};







const thStyle = {
  padding: "12px",
  fontWeight: "800",
};

const tdStyle = {
  padding: "12px",
  fontWeight: "600",
};




/* ===== STAT CARD ===== */


/* ===== STYLES ===== */



/* ===== STAT CARD ===== */


/* ===== STYLES ===== */


/* ----------------- UI COMPONENTS ----------------- */

/*function StatCard({ title, value }) {
  return (
    <div style={styles.card}>
      <h4>{title}</h4>
      <p style={{ fontSize: "26px", fontWeight: "bold" }}>{value}</p>
    </div>
  );
}*/

/* ----------------- STYLES ----------------- */



export default App;
