import { useState } from 'react';

// Main App Component
function App() {
  const [currentPage, setCurrentPage] = useState('login'); // 'login' or 'signup'

  return (
    <div>
      {currentPage === 'login' ? (
        <LoginPage onSwitchToSignup={() => setCurrentPage('signup')} />
      ) : (
        <SignUpPage onSwitchToLogin={() => setCurrentPage('login')} />
      )}
    </div>
  );
}

// Login Page Component
function LoginPage({ onSwitchToSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (username && password) {
      alert('Welcome ' + username + '! Login Successful!');
    } else {
      alert('Please fill all fields!');
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
      overflow: 'hidden'
    }}>
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
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '5px', margin: '0' }}>
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
            <a href="#" style={{ fontSize: '12px', color: '#f97316', textDecoration: 'none', fontWeight: '600' }}>
              Forgot?
            </a>
          </div>

          {/* Login Button */}
          <button
            onClick={handleLogin}
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

          {/* Social Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '18px' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              <span style={{ fontSize: '16px', marginRight: '5px' }}>🔵</span> Google
            </button>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              border: '2px solid #e5e7eb',
              borderRadius: '8px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600'
            }}>
              <span style={{ fontSize: '16px', marginRight: '5px' }}>📘</span> Facebook
            </button>
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
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSignUp = () => {
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      alert('Please fill all fields!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    if (!formData.agreeTerms) {
      alert('Please agree to Terms!');
      return;
    }

    alert('Welcome ' + formData.fullName + '!\n\n' + formData.accountType.toUpperCase() + ' account created!\n\nEmail: ' + formData.email);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 50%, #fed7aa 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '15px',
      overflow: 'hidden'
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
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', marginBottom: '5px', margin: '0' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
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

          {/* Account Type */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', color: '#374151', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
              Account Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
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

export default App;