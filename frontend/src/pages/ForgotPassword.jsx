import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../components/InputField';
import { forgotPassword, verifyOTP, resetPassword, login } from '../api/auth';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await forgotPassword(email);
      setMessage('OTP sent to your email successfully.');
      setStep(2);
    } catch (err) {
      let msg = 'Failed to send OTP';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        msg = Array.isArray(detail) ? detail.map(d => `${d.msg}`).join(', ') : String(detail);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyOTP(email, otp);
      setMessage('OTP verified successfully.');
      setStep(3);
    } catch (err) {
      let msg = 'Invalid OTP';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        msg = Array.isArray(detail) ? detail.map(d => `${d.msg}`).join(', ') : String(detail);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    setLoading(true);

    try {
      // Reset password
      await resetPassword(email, otp, newPassword);
      setMessage('Password reset successfully! Logging you in...');
      
      // Auto login after successful password reset
      try {
        const loginResponse = await login({ email, password: newPassword });
        
        // Store token and user data
        localStorage.setItem('token', loginResponse.access_token);
        localStorage.setItem('user', JSON.stringify(loginResponse.user));
        
        // Redirect to dashboard based on role
        setTimeout(() => {
          if (loginResponse.user?.role === 'admin') {
            navigate('/admin');
          } else if (loginResponse.user?.role === 'auditor') {
            navigate('/auditor');
          } else if (loginResponse.user?.role === 'support') {
            navigate('/support');
          } else {
            navigate('/app/dashboard');
          }
        }, 1500);
      } catch (loginErr) {
        console.error('Auto-login failed:', loginErr);
        // If auto-login fails, redirect to login page
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      let msg = 'Failed to reset password';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        msg = Array.isArray(detail) ? detail.map(d => `${d.msg}`).join(', ') : String(detail);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl flex w-full max-w-4xl overflow-hidden">
        
        <div className="hidden md:block w-1/2 bg-blue-600 relative">
          <img 
            src="/bank.jpg" 
            alt="Modern Banking" 
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/70 to-purple-700/70" />
          <div className="absolute inset-0 flex items-center justify-center p-8">
            <div className="text-white text-center">
              <h3 className="text-3xl font-bold mb-4">Reset Password</h3>
              <p className="text-lg opacity-90">Secure your account with a new password.</p>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 p-8">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
          {step === 1 ? 'Forgot Password' : step === 2 ? 'Enter OTP' : 'Reset Password'}
        </h2>
        
        {message && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{message}</div>
        )}
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
        )}

        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <InputField
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleOTPSubmit}>
            <p className="text-sm text-gray-600 mb-4">Enter the 6-digit OTP sent to {email}</p>
            <InputField
              label="OTP"
              type="text"
              name="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength="6"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handlePasswordReset}>
            <InputField
              label="New Password"
              type="password"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <InputField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-gray-600">
          Remember your password? <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
        </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;