import React from 'react';
import { User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ title }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="bg-gradient-to-b from-blue-800 via-purple-800 to-blue-800 backdrop-blur-sm border-b border-blue-100 px-6 py-3">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        
        <div className="flex items-center gap-4">
          {/* Profile Button */}
          <button
            onClick={() => navigate('/app/profile')}
            className="flex items-center gap-2 px-3 py-2 text-white hover:bg-white/10 rounded-lg transition-all"
            title="Profile"
          >
            <User size={18} />
          </button>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-white hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all"
            title="Logout"
          >
            <span className="text-lg">👋</span>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;