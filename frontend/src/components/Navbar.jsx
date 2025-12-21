import { Menu, Bell } from 'lucide-react';
import { useSidebar } from '../context/SidebarContext';
import useAuth from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const Navbar = ({ title }) => {
  const { toggleSidebar } = useSidebar();
  const { user } = useAuth();

  // 1. Helper to capitalize name
  const formatName = (name) => {
    if (!name) return 'User';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  // 2. Helper for initials
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const displayName = user?.name || 'achyuth';

  return (
    <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-6 sticky top-0 z-10">
      
      {/* LEFT SIDE */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
      </div>
      
      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">
        
        {/* A. BELL ICON - Changed path to lowercase "/alerts" */}
        <Link 
          to="/alerts" 
          className="relative p-1 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <Bell size={24} />
          <span className="absolute top-0 right-0.5 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </Link>

        {/* B. NAME AND PHOTO */}
        <div className="flex items-center gap-4">
          <span className="text-lg font-medium text-gray-700 hidden md:block">
            {formatName(displayName)}
          </span>

          <Link 
            to="/profile" 
            className="w-12 h-12 bg-sky-100 rounded-2xl overflow-hidden flex items-center justify-center text-sky-700 hover:opacity-90 transition-opacity shadow-sm"
          >
            {user?.profilePic ? (
              <img 
                src={user.profilePic} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="font-bold text-xl">
                {getInitials(displayName)}
              </span>
            )}
          </Link>
        </div>

      </div>
    </header>
  );
};

export default Navbar;