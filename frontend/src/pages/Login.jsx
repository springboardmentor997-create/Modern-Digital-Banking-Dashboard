import { useState, useEffect } from 'react';
import { login, forgotPassword, resetPassword } from '../api/auth';
import useAuth from '../hooks/useAuth';
import { useNavigate, Link, useSearchParams, useLocation } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  // Determine view based on path or token
  const getView = () => {
    if (location.pathname === '/forgot-password') return 'forgot';
    if (location.pathname === '/reset-password' || token) return 'reset';
    return 'login';
  };

  const view = getView();

  useEffect(() => {
    setError('');
    setMessage('');
  }, [location.pathname, token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = await login(email, password);
      loginUser(data.access_token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      await forgotPassword(email);
      setMessage('Check your email for the reset link');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
    }
    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      await resetPassword(token, password);
      setMessage('Password updated successfully');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLogin = () => (
    <form onSubmit={handleLogin} className="space-y-6">
      <div className="relative">
        <input
          type="text"
          placeholder="Email Address"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
      
      {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      
      <div className="mt-8 flex flex-col gap-4">
        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-sky-500 hover:text-sky-700 font-medium">Forgot Password?</Link>
        </div>
        <button className="w-full py-3 rounded-full font-semibold text-lg bg-sky-500 text-white shadow-lg hover:bg-sky-600 transition duration-200">
          Login
        </button>
        <p className="text-center text-gray-500">
          Don't have an account? <Link to="/register" className="text-sky-500 cursor-pointer hover:underline">Sign Up</Link>
        </p>
      </div>
    </form>
  );

  const renderForgotPassword = () => (
    <form onSubmit={handleForgotPassword} className="space-y-6">
      <div className="relative">
        <input
          type="email"
          placeholder="Email Address"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      {message && <p className="text-green-500 text-sm mt-2 text-center">{message}</p>}
      {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      
      <div className="mt-8 flex flex-col gap-4">
        <button 
          disabled={isLoading}
          className="w-full py-3 rounded-full font-semibold text-lg bg-sky-500 text-white shadow-lg hover:bg-sky-600 transition duration-200 disabled:opacity-50"
        >
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </button>
        <p className="text-center text-gray-500">
          <Link to="/login" className="text-sky-500 cursor-pointer hover:underline">Back to Login</Link>
        </p>
      </div>
    </form>
  );

  const renderResetPassword = () => (
    <form onSubmit={handleResetPassword} className="space-y-6">
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="New Password"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
      <div className="relative">
        <input
          type={showConfirmPassword ? "text" : "password"}
          placeholder="Confirm New Password"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition duration-200"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 focus:outline-none"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          {showConfirmPassword ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>
      </div>
      
      {message && <p className="text-green-500 text-sm mt-2 text-center">{message}</p>}
      {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
      
      <div className="mt-8 flex flex-col gap-4">
        <button 
          disabled={isLoading}
          className="w-full py-3 rounded-full font-semibold text-lg bg-sky-500 text-white shadow-lg hover:bg-sky-600 transition duration-200 disabled:opacity-50"
        >
          {isLoading ? 'Updating...' : 'Set New Password'}
        </button>
         <p className="text-center text-gray-500">
          <Link to="/login" className="text-sky-500 cursor-pointer hover:underline">Back to Login</Link>
        </p>
      </div>
    </form>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-8 py-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">
              {view === 'login' ? 'Login' : view === 'forgot' ? 'Forgot Password' : 'Reset Password'}
            </h2>
            <div className="w-16 h-1 bg-sky-500 mx-auto mt-2 rounded-full"></div>
            {view === 'forgot' && <p className="text-gray-500 mt-4">Enter your email to receive a reset link</p>}
          </div>
          
          {view === 'login' && renderLogin()}
          {view === 'forgot' && renderForgotPassword()}
          {view === 'reset' && renderResetPassword()}
        </div>
      </div>
    </div>
  );
};

export default Login;
