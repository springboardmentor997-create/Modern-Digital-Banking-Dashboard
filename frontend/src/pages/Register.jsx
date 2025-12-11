import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png'; // Make sure this path is correct

const Register = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    // Add your registration API logic here
    console.log('Registering:', formData);
    alert('Registration Successful! Redirecting to login...');
    navigate('/login');
  };

  return (
    // MAIN PAGE BACKGROUND (Matches Login)
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#904DC9] via-[#2F64A6] to-[#5B43A3] p-4">
      
      {/* BACKGROUND ART */}
      <svg className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 0 L0 20 Q 50 500 100 50 L90 0 Z" fill="none" stroke="white" strokeWidth="0.3" />
        <path d="M0 100 L0 50 Q 50 0 40 50 L90 200 Z" fill="none" stroke="white" strokeWidth="0.3" />
      </svg>

      {/* CARD CONTAINER */}
      <div className="bg-white shadow-2xl rounded-2xl flex overflow-hidden max-w-5xl w-full min-h-[600px]">
        
        {/* --- LEFT SIDE: REGISTER FORM --- */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col relative z-10">
          
          {/* Logo Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
               <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
               <span className="text-xl font-bold text-slate-800 tracking-wide">MyBank</span>
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 flex flex-col justify-center">
            <h4 className="text-xl font-bold text-slate-800 mb-2">Create Account</h4>
            <p className="text-slate-400 text-sm mb-8">Join us to manage your finances.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* WRAPPER: Pulls inputs up */}
              <div className="flex flex-col gap-6 -mt-2">
                
                {/* Full Name Input */}
                <div className="relative">
                  <input 
                    type="text" 
                    id="fullName"
                    className="peer w-full border-b border-gray-300 py-2 text-slate-900 placeholder-transparent focus:border-[#4c1d95] focus:outline-none transition-colors"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="fullName" className="absolute left-0 -top-3.5 text-xs text-slate-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-[#4c1d95]">
                    Full Name
                  </label>
                </div>

                {/* Email Input */}
                <div className="relative">
                  <input 
                    type="email" 
                    id="email"
                    className="peer w-full border-b border-gray-300 py-2 text-slate-900 placeholder-transparent focus:border-[#4c1d95] focus:outline-none transition-colors"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="email" className="absolute left-0 -top-3.5 text-xs text-slate-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-[#4c1d95]">
                    Email Address
                  </label>
                </div>

                {/* Password Input */}
                <div className="relative">
                  <input 
                    type="password" 
                    id="password"
                    className="peer w-full border-b border-gray-300 py-2 text-slate-900 placeholder-transparent focus:border-[#4c1d95] focus:outline-none transition-colors"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="password" className="absolute left-0 -top-3.5 text-xs text-slate-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-[#4c1d95]">
                    Password
                  </label>
                </div>

                {/* Confirm Password Input */}
                <div className="relative">
                  <input 
                    type="password" 
                    id="confirmPassword"
                    className="peer w-full border-b border-gray-300 py-2 text-slate-900 placeholder-transparent focus:border-[#4c1d95] focus:outline-none transition-colors"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <label htmlFor="confirmPassword" className="absolute left-0 -top-3.5 text-xs text-slate-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-[#4c1d95]">
                    Confirm Password
                  </label>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4">
                  <button 
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-sm text-slate-500 hover:text-[#4c1d95] transition-colors"
                  >
                    Already have an account?
                  </button>
                  
                  <button 
                    type="submit" 
                    className="bg-[#2e1065] hover:bg-[#4c1d95] text-white font-bold py-3 px-8 rounded-full shadow-lg transform transition hover:scale-105"
                  >
                    SIGN UP
                  </button>
                </div>

              </div> 
            </form>
          </div>
        </div>

        {/* --- RIGHT SIDE: ARTWORK (Reused from Login for consistency) --- */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#2e1065] via-[#4c1d95] to-[#701a75] relative items-center p-12 overflow-hidden">
          <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-[-20%] left-[-20%] w-96 h-96 bg-pink-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
          
          <div className="relative z-10 text-white">
            <h1 className="text-4xl font-bold mb-4">Join <br/> MyBank Today</h1>
            <p className="text-md text-purple-200 mb-8">Start your journey towards better financial management with our secure platform.</p>
            
            {/* Changed Icon to a 'User Plus' icon for Registration */}
            <div className="absolute -right-16 bottom-[-150px] w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-2xl animate-bounce-slow">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-[#4c1d95]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
               </svg>
            </div>
          </div>
          
          <svg className="absolute top-0 right-0 opacity-20" width="400" height="800" viewBox="0 0 400 800">
             <path d="M0 600 C 100 500, 300 700, 400 600" stroke="white" strokeWidth="2" fill="none" />
             <path d="M0 400 C 100 300, 300 500, 400 400" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        </div>

      </div>
    </div>
  );
};

export default Register;