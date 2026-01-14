import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthNavbar from '../components/AuthNavbar';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      console.log('Attempting login...');
      const success = await login({ email, password });
      console.log('Login success:', success);
      console.log('Token in localStorage:', localStorage.getItem('token'));
      console.log('User in localStorage:', localStorage.getItem('user'));
      
      if (success) {
        console.log('Navigating to dashboard...');
        navigate('/app/dashboard');
      } else {
        setError('Login failed - no token received');
      }
    } catch (err) {
      console.error('Login error:', err);
      const message = err.message || 'Login failed';
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
        <div className="absolute top-20 left-10 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-1 h-1 bg-blue-300/40 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-60 left-1/3 w-1.5 h-1.5 bg-purple-300/30 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-40 right-1/4 w-2 h-2 bg-white/20 rounded-full animate-pulse delay-700"></div>
        <div className="absolute bottom-20 left-1/4 w-1 h-1 bg-blue-200/30 rounded-full animate-pulse delay-300"></div>
        
        {/* Floating Bubbles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/3 rounded-full blur-3xl animate-pulse delay-500"></div>
        
        {/* Geometric Shapes */}
        <div className="absolute top-40 right-40 w-4 h-4 border border-white/10 rotate-45 animate-spin" style={{animationDuration: '20s'}}></div>
        <div className="absolute bottom-60 left-40 w-6 h-6 border border-blue-300/10 rotate-12 animate-spin" style={{animationDuration: '15s'}}></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 right-1/3 w-32 h-32 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-2xl animate-pulse delay-200"></div>
        <div className="absolute bottom-1/3 left-1/5 w-24 h-24 bg-gradient-to-r from-purple-400/10 to-blue-400/10 rounded-full blur-2xl animate-pulse delay-800"></div>
      </div>
      
      <AuthNavbar />
      
      <div className="flex items-start justify-center min-h-[calc(100vh-60px)] p-6 relative z-10 pt-8">
        <div className="w-full max-w-4xl flex items-center justify-center gap-6">
          
          {/* Left Side - Banking Visual */}
          <div className="hidden lg:flex w-1/2 items-center justify-center pr-12">
            <div className="relative">
              <div className="w-96 h-96 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl backdrop-blur-sm border border-white/10 flex items-center justify-center overflow-hidden">
                <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
                  {/* Credit Cards Stack */}
                  <div className="relative mb-6">
                    <div className="w-60 h-36 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-2xl transform rotate-6 absolute">
                      <div className="p-4 h-full flex flex-col justify-between text-white">
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-8 bg-yellow-400 rounded opacity-90"></div>
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-mono tracking-wider">•••• •••• •••• 1234</div>
                          <div className="text-xs opacity-80 mt-1 font-semibold">JOHN SMITH</div>
                          <div className="text-xs opacity-70">VALID THRU 12/28</div>
                        </div>
                      </div>
                    </div>
                    <div className="w-60 h-36 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-xl transform -rotate-3">
                      <div className="p-4 h-full flex flex-col justify-between text-white">
                        <div className="flex justify-between items-start">
                          <div className="w-10 h-8 bg-orange-400 rounded opacity-90"></div>
                          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-mono tracking-wider">•••• •••• •••• 5678</div>
                          <div className="text-xs opacity-80 mt-1 font-semibold">PREMIUM CARD</div>
                          <div className="text-xs opacity-70">VALID THRU 08/29</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Banking Features */}
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                      </svg>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-3 -right-3 w-6 h-6 bg-blue-400/30 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-3 -left-3 w-4 h-4 bg-purple-400/30 rounded-full animate-pulse delay-500"></div>
            </div>
          </div>
          
          {/* Right Side - Login Form */}
          <div className="w-full lg:w-1/2 max-w-sm">
            {/* Enhanced Login Card */}
            <div className="w-full bg-white/95 backdrop-blur-xl rounded-lg shadow-2xl overflow-hidden border border-white/20 relative">
              
              {/* Gradient Accent Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600"></div>

              <div className="px-8 py-8">
                <div className="mb-6 text-center">
                  <div className="w-24 h-24 mx-auto mb-3 flex items-center justify-center">
                    <img src="/bank_logo.png" alt="ASUNova Bank" className="w-full h-full object-contain" />
                  </div>
                  <h1 className="text-lg font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight mb-1">
                    ASUNova
                  </h1>
                  <h2 className="text-xl font-bold text-slate-700 mb-2">
                    Welcome Back
                  </h2>
                  <p className="text-slate-500 text-sm font-medium">
                    Please enter your details to sign in
                  </p>
                  
                  {/* Demo / Sample Account Credentials (for demo only) */}
                  <details className="mt-3 text-xs bg-blue-50 rounded-lg p-3">
                    <summary className="cursor-pointer text-blue-700 font-semibold">
                      🔑 Demo Account Samples
                    </summary>
                    <div className="mt-2 space-y-2 text-slate-600">
                      <p className="text-xs mb-2">Test the system with these demo accounts or create your own on the <strong>Register</strong> page.</p>
                      <div className="border-l-2 border-blue-400 pl-2 mb-1">
                        <div className="font-semibold text-blue-700">Admin</div>
                        <div className="text-xs">admin@bank.com / admin123</div>
                      </div>
                      <div className="border-l-2 border-purple-400 pl-2 mb-1">
                        <div className="font-semibold text-purple-700">Auditor</div>
                        <div className="text-xs">auditor@bank.com / auditor123</div>
                      </div>
                      <div className="border-l-2 border-green-400 pl-2 mb-1">
                        <div className="font-semibold text-green-700">Support</div>
                        <div className="text-xs">support@bank.com / support123</div>
                      </div>
                      <div className="border-l-2 border-orange-400 pl-2">
                        <div className="font-semibold text-orange-700">User</div>
                        <div className="text-xs">user@bank.com / user123</div>
                      </div>
                    </div>
                  </details>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest mb-1 ml-1">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      className="w-full px-3 py-2.5 bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white transition-all text-slate-700 backdrop-blur-sm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {/* Password Input with Forgot Password Option */}
                  <div>
                    <div className="flex justify-between items-center mb-1 ml-1">
                      <label className="block text-xs font-bold text-slate-600 uppercase tracking-widest">Password</label>
                      <Link 
                        to="/forgot-password" 
                        className="text-xs font-bold text-blue-600 hover:text-purple-600 transition-colors underline underline-offset-2"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full px-3 py-2.5 bg-gradient-to-r from-purple-50/50 to-blue-50/50 border border-purple-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:bg-white transition-all text-slate-700 backdrop-blur-sm"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-blue-500 focus:outline-none transition-colors"
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
                  
                  {error && <p className="text-red-500 text-xs font-bold mt-2 text-center bg-red-50/80 py-2 px-3 rounded-lg border border-red-200/50 backdrop-blur-sm">{error}</p>}
                  
                  <div className="pt-2">
                    <button
                      disabled={isLoading}
                      className="w-full py-3 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 flex items-center justify-center transform hover:scale-[1.02]"
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </>
                      ) : 'Sign In'}
                    </button>
                    
                    <div className="mt-6 text-center">
                      <p className="text-slate-500 text-sm font-medium">
                        Don't have an account? 
                        <Link to="/register" className="ml-1 text-blue-600 hover:text-purple-600 font-extrabold transition-colors">
                          Create for free
                        </Link>
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;