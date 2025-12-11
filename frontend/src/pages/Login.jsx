import React, { useState } from 'react';
import logo from '../assets/logo.png'; 

const Login = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Login attempt for: ${id}`);
  };

  return (
    // MAIN PAGE BACKGROUND
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#904DC9FF] via-[#2F64A6FF] to-[#5B43A3FF] p-4">
      {/* --- BACKGROUND ART: Big Curvy Lines --- */}
<svg className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
   <path d="M0 0 L0 20 Q 50 500 100 50 L90 0 Z" fill="none" stroke="white" strokeWidth="0.3" />
   <path d="M0 100 L0 50 Q 50 0 40 50 L90 200 Z" fill="none" stroke="white" strokeWidth="0.3" />


</svg>
      {/* CARD CONTAINER */}
      <div className="bg-white shadow-2xl rounded-2xl flex overflow-hidden max-w-5xl w-full min-h-[600px]">
        
        {/* --- LEFT SIDE: LOGIN FORM --- */}
        <div className="w-full md:w-1/2 p-10 md:p-14 flex flex-col">
          
          {/* 1. Logo Section */}
          <div className="mb-10">
            <div className="flex items-center gap-2">
               <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
               <span className="text-xl font-bold text-slate-800 tracking-wide">MyBank</span>
            </div>
          </div>

          {/* 2. Form Section */}
          <div className="flex-1 flex flex-col justify-center">
            
            {/* Header Text (Removed 'absolute' so it sits perfectly) */}
            <h4 className="text-xl font-normal text-slate-800 mb-10">Please enter your details</h4>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* --- WRAPPER DIV: Groups Inputs & Button together --- */}
              {/* The -mt-2 pulls everything up slightly closer to the text */}
              <div className="flex flex-col gap-8 -mt-2">
                
                {/* ID Input */}
                <div className="relative">
                  <input 
                    type="text" 
                    className="peer w-full border-b border-gray-300 py-2 text-slate-900 placeholder-transparent focus:border-[#4c1d95] focus:outline-none transition-colors"
                    id="id"
                    placeholder="ID Name"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    required
                  />
                  <label 
                    htmlFor="id"
                    className="absolute left-0 -top-3.5 text-xs text-slate-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-[#4c1d95]"
                  >
                    User ID
                  </label>
                </div>

                {/* Password Input */}
                <div className="relative">
                  <input 
                    type="password" 
                    className="peer w-full border-b border-gray-300 py-2 text-slate-900 placeholder-transparent focus:border-[#4c1d95] focus:outline-none transition-colors"
                    id="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <label 
                    htmlFor="password"
                    className="absolute left-0 -top-3.5 text-xs text-slate-400 transition-all peer-placeholder-shown:text-base peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-xs peer-focus:text-[#4c1d95]"
                  >
                    Password
                  </label>
                </div>

                {/* Footer Actions & Button */}
                <div className="flex items-center justify-between pt-2">
                  <a href="#" className="text-sm text-[#4c1d95] hover:text-[#5d35e1] transition-colors">Create an Account?</a>
                  
                  <button 
                    type="submit" 
                    className="bg-[#2e1065] hover:bg-[#4c1d95] text-white font-bold py-3 px-10 rounded-full shadow-lg transform transition hover:scale-105"
                  >
                    LOG IN
                  </button>
                </div>

              </div> 
              {/* --- END OF WRAPPER DIV --- */}
              
            </form>
          </div>
        </div>

        {/* --- RIGHT SIDE: ARTWORK --- */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#2e1065] via-[#4c1d95] to-[#701a75] relative items-center p-12 overflow-hidden">
          <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-[-20%] left-[-20%] w-96 h-96 bg-pink-500 rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
          
          <div className="relative z-10 text-white">
            <h1 className="text-5xl font-bold mb-6">Welcome to <br/> MyBank</h1>
            <p className="text-lg text-purple-200 mb-8">Log in to access your account and manage your finances securely.</p>
            
            <div className="absolute -right-16 bottom-[-150px] w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-2xl animate-bounce-slow">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-[#4c1d95]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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

export default Login;   