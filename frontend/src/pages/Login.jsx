import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function Login() {
  const [isLoginPage, setIsLoginPage] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    console.log("Form Submitted:", form);
  }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-500 to-white-50 flex items-center justify-center p-4">
//       <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">

//         <div className="bg-gradient-to-r from-blue-600 to-purple-500 text-center text-white">
//           <h1 className="text-3xl font-bold">
//             {isLoginPage ? "Welcome Back" : "Create Account"}
//           </h1>
//           <p className="text-purple-100 mt-1">
//             {isLoginPage
//               ? "Login to continue your journey"
//               : "Sign up to get started"}
//           </p>
//         </div>

//         <form onSubmit={handleSubmit} className="p-8 space-y-6">

//           {!isLoginPage && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Full Name
//               </label>
//               <div className="relative">
//                 <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
//                 <input
//                   name="name"
//                   type="text"
//                   placeholder="John Doe"
//                   value={form.name}
//                   onChange={handleChange}
//                   className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
//                 />
//               </div>
//             </div>
//           )}

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Email Address
//             </label>
//             <div className="relative">
//               <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
//               <input
//                 name="email"
//                 type="email"
//                 placeholder="you@example.com"
//                 value={form.email}
//                 onChange={handleChange}
//                 className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
//               />
//             </div>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Password
//             </label>
//             <div className="relative">
//               <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
//               <input
//                 name="password"
//                 type={showPassword ? "text" : "password"}
//                 placeholder="••••••••"
//                 value={form.password}
//                 onChange={handleChange}
//                 className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 className="absolute right-3 top-3 text-gray-400"
//               >
//                 {showPassword ? <EyeOff /> : <Eye />}
//               </button>
//             </div>
//           </div>

//           {isLoginPage && (
//             <div className="flex items-center justify-between">
//               <label className="flex items-center text-sm text-gray-600">
//                 <input type="checkbox" className="mr-2" /> Remember me
//               </label>
//               <button type="button" className="text-purple-600 text-sm">
//                 Forgot password?
//               </button>
//             </div>
//           )}

//           <button className="w-full bg-gradient-to-r from-blue-600 to-purple-700  text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2">
//             {isLoginPage ? "Sign In" : "Create Account"}
//             <ArrowRight className="w-5 h-5" />
//           </button>

//         </form>

//         <div className="text-center pb-6">
//           <p className="text-gray-600">
//             {isLoginPage ? "Don't have an account?" : "Already have an account?"}
//             <button
//               onClick={() => setIsLoginPage(!isLoginPage)}
//               className="text-purple-600 font-semibold ml-1"
//             >
//               {isLoginPage ? "Sign Up" : "Sign In"}
//             </button>
//           </p>
//         </div>

//       </div>
//     </div>
//   );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-200 to-blue-300 relative overflow-hidden">

      {/* ---- Blurred Background Blobs ---- */}
      <div className="absolute w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-30 top-10 left-10"></div>
      <div className="absolute w-80 h-80 bg-purple-400 rounded-full blur-3xl opacity-30 bottom-10 right-10"></div>

      {/* ---- Main Content Wrapper ---- */}
      <div className="w-[90%] max-w-6xl bg-white/30 backdrop-blur-xl shadow-2xl rounded-3xl p-10 flex items-center justify-between">

        {/* ------- LEFT: LOGIN CARD ------- */}
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8">

          <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
            Sign In
          </h2>

          <div className="mb-5">
            <label className="text-gray-700 text-sm">Email</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                placeholder="jordan@gmail.com"
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="text-gray-700 text-sm">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-3 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-xl font-semibold">
            Sign In
          </button>
        </div>

        {/* ------- RIGHT: ILLUSTRATION / WELCOME TEXT ------- */}
        <div className="hidden md:flex flex-col items-center text-center px-6">
          <h1 className="text-3xl font-bold text-blue-800 mb-4">
            Welcome to the Universal Trading Digital Wallet
          </h1>

          <p className="text-blue-600 max-w-sm">
            Track analytics, grow your portfolio, and enjoy a secure digital trading experience.
          </p>

          {/* Placeholder for illustration */}
          <div className="w-72 h-56 bg-blue-200 rounded-2xl mt-6 opacity-60"></div>
        </div>

      </div>
    </div>
  );
}
