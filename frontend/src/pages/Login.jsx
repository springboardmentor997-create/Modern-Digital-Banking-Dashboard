import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import login from "../images/login.jpg";
import signup from "../images/signup.jpg";

export default function Login() {
  const [isLoginPage, setIsLoginPage] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [clicked, setClicked] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const [errors, setErrors] = useState({});

  function handleClick(target) {
    setClicked(target);
    setTimeout(() => setClicked(""), 300);
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setErrors({ ...errors, [e.target.name]: "" }); 
  }

  function validate() {
    let err = {};

    if (!isLoginPage) {
      if (!form.name.trim()) err.name = "Name is required";
      else if (!/^[A-Za-z\s]+$/.test(form.name))
        err.name = "Only letters allowed";
    }

    if (!form.email.trim()) err.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = "Invalid email format";

    if (!form.password.trim()) err.password = "Password is required";
    else if (form.password.length < 6)
      err.password = "Password must be at least 6 characters";

    return err;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    alert("Form Submitted: " + JSON.stringify(form));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white-300 relative overflow-hidden">

      <div className="w-[80%] max-w-6xl bg-white/70 backdrop-blur-xl shadow-2xl rounded-3xl p-7 flex items-center justify-center lg:p-10">

        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-4 lg:p-8">

          <h2 className="text-xl font-bold text-center text-blue-700 mt-2 mb-2">
            {isLoginPage
              ? "Login to continue your journey"
              : "Sign up to get started"}
          </h2>

          <form onSubmit={handleSubmit} className="p-2 space-y-6">

            {!isLoginPage && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {isLoginPage && (
              <button
                type="button"
                onClick={() => handleClick("forget")}
                className={`text-blue-600 text-sm ${
                  clicked === "forget" ? "text-blue-800" : ""
                }`}
              >
                Forgot password?
              </button>
            )}

            <button
              type="submit"
              onClick={() => handleClick("Sign")}
              className={`w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-md hover:opacity-90 ${
                clicked === "Sign" ? "scale-105" : "scale-100"
              }`}
            >
              {isLoginPage ? "Sign In" : "Create Account"}
              <ArrowRight className="w-5 h-5" />
            </button>

          </form>

          <div className="text-center pb-6">
            <p className="text-gray-600">
              {isLoginPage ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLoginPage(!isLoginPage)}
                className="text-blue-600 font-semibold ml-1 hover:scale-95"
              >
                {isLoginPage ? "Sign Up" : "Sign In"}
              </button>
            </p>
          </div>
        </div>

        {isLoginPage ? (
          <div className="hidden md:flex flex-col items-center text-center px-6">
            <h1 className="text-3xl font-bold text-blue-800 mb-4">
              Welcome Back to Tivra – Your Smart Digital Banking Hub
            </h1>
            <p className="text-blue-600 max-w-sm">
              Securely access your account and manage your finances in real time
            </p>
            <div className="w-72 h-56 bg-blue-200 rounded-2xl mt-6 opacity-60">
              <img src={login} alt="login" />
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-col items-center text-center px-6">
            <h1 className="text-3xl font-bold text-blue-800 mb-4">
              Welcome to Tivra – Your Smart Digital Banking Hub
            </h1>
            <p className="text-blue-600 max-w-sm">
              Securely access your account and manage your finances in real time
            </p>
            <div className="w-72 h-56 bg-blue-200 rounded-2xl mt-6 opacity-60">
              <img src={signup} alt="signup" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
