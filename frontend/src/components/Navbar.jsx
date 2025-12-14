import { Menu, X,Building2 } from "lucide-react";
import React,{ useState , useEffect} from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);
  }, []);

  const handleAccountClick = () => {
    if (isLoggedIn) {
      navigate("/Dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <nav className="w-full fixed top-0 left-0 z-50 backdrop-blur-lg bg-white/10 border-b border-white/20 ">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        
        <div className="text-2xl font-bold text-blue-600 tracking-wide flex">
          <Building2 className="m-1"/> Tivra
        </div>

        <ul className="hidden md:flex gap-12 text-gray-700 font-medium">
          <li className="hover:text-blue-600 transition">Home</li>
          <li className="hover:text-blue-600 transition">Services</li>
          <li className="hover:text-blue-600 transition">Analytics</li>
          <li className="hover:text-blue-600 transition">Support</li>
        </ul>

        <button
          onClick={handleAccountClick}
          className="hidden md:block px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all">
          {isLoggedIn ? (
            <>
              <UserCircle className="w-5 h-5" />
              <span>My Account</span>
            </>
          ) : (
            <span>Login</span>
          )}
        </button>

        <button onClick={() => setOpen(!open)} className="md:hidden">
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-white/80 backdrop-blur-lg px-6 py-4 flex flex-col gap-4 text-gray-800 font-medium border-b border-gray-200">
          <a className="py-2 hover:text-blue-600 transition">Home</a>
          <a className="py-2 hover:text-blue-600 transition">Services</a>
          <a className="py-2 hover:text-blue-600 transition">Analytics</a>
          <a className="py-2 hover:text-blue-600 transition">Support</a>
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
