import { Menu, X,Building2,UserCircle,LogIn } from "lucide-react";
import React,{ useState , useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  
  const { isLoggedIn } = useAuth();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleAccountClick = () => {
    try {
      if (!user) return navigate("/login");

      switch (user.role) {
        case "admin":
          navigate("/AdminDashboard");
          break;
        default:
          navigate("/Dashboard");
      }

      setOpen(false);
    } catch (err) {
      navigate("/login");
    }
  };


  return (
    <nav className="w-full fixed top-0 left-0 z-50 backdrop-blur-lg bg-white/10 border-b border-white/20 mb-100">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        
        <div className="text-2xl font-bold text-blue-600 tracking-wide flex">
          <Building2 className="m-1"/> Tivra
        </div>

        <ul className="hidden md:flex gap-12 text-gray-700 font-medium">
          <Link to = '/' className="hover:text-blue-600 transition">Home</Link>
          <Link to="/Services" className="hover:text-blue-600 transition">Services</Link>
          {user?.role === 'user' && (<Link to = '/Analytics' className="hover:text-blue-600 transition">Analytics</Link>)}
          <Link to = '/Support' className="hover:text-blue-600 transition">Support</Link>
        </ul>

        <button
          onClick={handleAccountClick}
          className=" hidden md:flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 hover:bg-blue-100 hover:scale-105 active:scale-95">
          {isLoggedIn ? (
            <UserCircle className="w-8 h-8 text-blue-600" />
          ) : (
            <>
              <LogIn className="w-5 h-5 text-blue-600" />
              <span className="text-blue-600 font-medium">Login</span>
            </>
          )}
        </button>


        <button onClick={() => setOpen(!open)} className="md:hidden">
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white/80 backdrop-blur-lg px-6 py-4 flex flex-col gap-4 text-gray-800 font-medium border-b border-gray-200">
          <Link to = '/' className="hover:text-blue-600 transition">Home</Link>
          <Link to = '/Services' className="hover:text-blue-600 transition">Services</Link>
          {user?.role === 'user' && (<Link to = '/Analytics' className="hover:text-blue-600 transition">Analytics</Link>)}
          <Link to = '/Support' className="hover:text-blue-600 transition">Support</Link>
          <button
            onClick={handleAccountClick}
            className="mt-2 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all"
          >
            {isLoggedIn ? (
              <>
                <UserCircle className="w-5 h-5" />
                <span>My Account</span>
              </>
            ) : (
              <span>Login</span>
            )}
          </button>
        </div>
      )}
    </nav>
  );
}
