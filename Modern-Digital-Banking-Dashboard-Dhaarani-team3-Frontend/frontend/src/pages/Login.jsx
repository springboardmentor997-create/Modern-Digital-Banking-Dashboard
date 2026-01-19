import React, { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { login, register } from "../api/auth.js";
import loginImg from "../images/login.jpg";
import signupImg from "../images/signup.jpg";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import Load from "../components/Loader.jsx";

export default function Login() {
  const [isLoginPage, setIsLoginPage] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [clicked, setClicked] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const { loginUser } = useAuth();

  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: location.state?.role
  });

  const [errors, setErrors] = useState({});

  function handleClick(target) {
    setClicked(target);
    setTimeout(() => setClicked(""), 300);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked ? "verified" : "unverified" : value
    });

    setErrors({ ...errors, [name]: "" }); 
  }

  function validate() {
    let err = {};

    if (!isLoginPage) {
      if (!form.name.trim()) err.name = "Name is required";
      else if (!/^[A-Za-z\s]+$/.test(form.name))
        err.name = "Only letters allowed";
      
      if (form.phone && form.phone.length !== 10)  err.phone = "Mobile No. must have 10 digits";
    }

    if (!form.email.trim()) err.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      err.email = "Invalid email format";

    if (!form.password.trim()) err.password = "Password is required";
    else if (form.password.length < 6)
      err.password = "Password must be at least 6 characters";

    return err;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      let data,role;
      if (isLoginPage) {
        data = await login(form.email, form.password);
      }
      else {
        data = await register(form.name, form.email, form.password, form.phone,form.role);
        role = form.role;
      }
      const user = await loginUser(data);
      role = user.role
      if (role === "admin") navigate("/AdminDashboard");
      else if (role === "Auditor") navigate("/AuditorDashboard");
      else navigate("/Dashboard");
      
      toast.success(isLoginPage ? "Login successful!" : "Account created successfully!");
    } catch (error) {
      let errorMessage = "Something went wrong";
      
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.detail) {
        errorMessage = error.detail;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      
      if (errorMessage.toLowerCase().includes('email')) {
        setErrors({ email: errorMessage });
      } else if (errorMessage.toLowerCase().includes('password')) {
        setErrors({ password: errorMessage });
      } else if (errorMessage.toLowerCase().includes('already exists')) {
        setErrors({ email: "Email already registered" });
      } else if (errorMessage.toLowerCase().includes('invalid credentials')) {
        setErrors({ email: "Invalid email or password", password: "Invalid email or password" });
      }
      
    } finally {
      setLoading(false);
    }
  }

  function handleToggleForm() {
    setIsLoginPage(!isLoginPage);
    setForm({ name: "", email: "", phone: "", password: "", role: location.state?.role });
    setErrors({});
  }

  if (loading){
    return <Load/>
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
              <>
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
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                      name="phone"
                      type="tel"
                      placeholder="eg.- 8845222251"
                      value={form.phone}
                      onChange={handleChange}
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </>
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
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
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
                  disabled={loading}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              onClick={() => handleClick("Sign")}
              disabled={loading}
              className={`w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                clicked === "Sign" && !loading ? "scale-105" : "scale-100"
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <>
                  {isLoginPage ? "Sign In" : "Create Account"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pb-6">
            <p className="text-gray-600">
              {isLoginPage ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={handleToggleForm}
                disabled={loading}
                className="text-blue-600 font-semibold ml-1 hover:text-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="w-72 h-56 bg-blue-200 rounded-2xl mt-6 overflow-hidden">
              <img src={loginImg} alt="login" className="w-full h-full object-cover" />
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
            <div className="w-72 h-56 bg-blue-200 rounded-2xl mt-6 overflow-hidden">
              <img src={signupImg} alt="signup" className="w-full h-full object-cover" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
