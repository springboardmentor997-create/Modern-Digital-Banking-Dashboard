import { useState } from 'react';
import { register } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthNavbar from '../components/AuthNavbar';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
    }

    setIsLoading(true);

    try {
      const payload = { 
        email: email, 
        password: password, 
        name: name
      };

      const response = await register(payload);
      
      // Always redirect to login page after successful registration
      navigate('/login');

    } catch (err) {
      console.error('Registration error:', err);
      let message = 'Registration failed';
      
      if (err.response?.data?.detail) {
        message = err.response.data.detail;
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (err.message) {
        message = err.message;
      }
      
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 relative overflow-hidden">
      {/* Professional Background Elements */}
      <div className="absolute inset-0">
        {/* Animated Stars */}
        <div className="absolute top-16 left-16 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-28 right-24 w-1 h-1 bg-blue-300/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-52 left-1/4 w-1.5 h-1.5 bg-purple-300/30 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-32 right-1/3 w-2 h-2 bg-white/20 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-16 left-1/5 w-1 h-1 bg-blue-200/30 rounded-full animate-pulse delay-300"></div>
        <div className="absolute top-1/3 right-1/5 w-1.5 h-1.5 bg-purple-200/25 rounded-full animate-pulse delay-900"></div>
        
        {/* Floating Bubbles */}
        <div className="absolute top-10 left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 right-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Geometric Shapes */}
        <div className="absolute top-36 right-36 w-4 h-4 border border-white/10 rotate-45 animate-spin" style={{animationDuration: '20s'}}></div>
        <div className="absolute bottom-52 left-36 w-6 h-6 border border-blue-300/10 rotate-12 animate-spin" style={{animationDuration: '15s'}}></div>
        <div className="absolute top-2/3 left-2/3 w-3 h-3 border border-purple-300/10 rotate-45 animate-spin" style={{animationDuration: '25s'}}></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 right-1/4 w-28 h-28 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-2xl animate-pulse delay-200"></div>
        <div className="absolute bottom-1/4 left-1/6 w-20 h-20 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-full blur-2xl animate-pulse delay-800"></div>
      </div>
      
      <AuthNavbar />
      
      <div className="flex items-start justify-center min-h-[calc(100vh-60px)] p-4 relative z-10 pt-8">
        <div className="w-full max-w-4xl bg-white/95 backdrop-blur-xl rounded-lg shadow-2xl overflow-hidden flex flex-col md:flex-row border border-white/20">
        
        {/* Left Side - Bank Image */}
        <div className="w-full md:w-1/2 relative">
          <img src="/bank.jpg" alt="ASUNova Bank" className="w-full h-full object-cover" />
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 px-4 py-6">
          <div className="text-center mb-4">
            <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
              <img src="/bank_logo.png" alt="ASUNova Bank" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-sm font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ASUNova
            </h1>
            <h2 className="text-lg font-bold text-slate-700">Create Account</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-3 py-2 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all text-slate-700 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full px-3 py-2 bg-gradient-to-r from-purple-50/50 to-blue-50/50 border border-purple-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all text-slate-700 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="w-full px-3 py-2 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all text-slate-700 text-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-2 text-slate-400 hover:text-blue-500 focus:outline-none transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                  )}
                </button>
              </div>
            </div>
            
            <div>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  className="w-full px-3 py-2 bg-gradient-to-r from-purple-50/50 to-blue-50/50 border border-purple-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all text-slate-700 text-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-2 text-slate-400 hover:text-purple-500 focus:outline-none transition-colors"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                  )}
                </button>
              </div>
            </div>
            
            
            {error && <p className="text-red-500 text-xs text-center bg-red-50/80 py-1 px-2 rounded border border-red-200/50">{error}</p>}
            
            <button 
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 shadow-lg transition-all disabled:opacity-50 flex items-center justify-center text-sm">
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : 'Create Account'}
            </button>
            
            <div className="text-center">
              <p className="text-slate-500 text-xs">
                Already have an account? 
                <Link to="/login" className="text-blue-600 hover:text-purple-600 font-bold transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Register;