import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { Menu, User, Bell } from 'lucide-react'; 
import useAuth from '../hooks/useAuth';
import Sidebar from './Sidebar';
import { useSidebar } from '../context/SidebarContext'; 

const ProtectedRouter = () => {
  const { token, user } = useAuth();
  const { isSidebarOpen, toggleSidebar } = useSidebar(); 
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return 'Dashboard';
      case '/dashboard': return 'Dashboard';
      case '/accounts': return 'My Accounts';
      case '/transactions': return 'Transactions';
      case '/budgets': return 'Budgets';
      case '/bills': return 'Bills & Utilities';
      case '/rewards': return 'Rewards';
      case '/alerts': return 'Notifications';
      case '/profile': return 'My Profile';
      default: return 'BankApp';
    }
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* 1. FIXED SIDEBAR */}
      <Sidebar />
      
      {/* 2. MAIN CONTENT - PUSHED BY MARGIN */}
      <div 
        className={`
          flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out
          /* MOBILE: No margin (Sidebar overlaps) */
          ml-0 
          /* DESKTOP/TABLET: Push content based on Sidebar state */
          ${isSidebarOpen ? 'md:ml-64' : 'md:ml-20'}
        `}
      >
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-20">
          <div className="flex items-center gap-4">
            {/* Mobile Toggle Button */}
            <button 
              onClick={toggleSidebar} 
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-gray-800">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            <Link to="/profile" className="flex items-center gap-3 hover:bg-gray-50 p-1.5 pr-3 rounded-full transition-colors border border-transparent hover:border-gray-200">
              <div className="w-9 h-9 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center font-bold text-sm border border-sky-200">
                {user?.name ? user.name.charAt(0).toUpperCase() : <User size={18} />}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-gray-700 leading-none">{user?.name || 'My Account'}</p>
                <p className="text-xs text-gray-500 mt-0.5">View Profile</p>
              </div>
            </Link>
          </div>
        </header>

        {/* SCROLLABLE PAGE CONTENT */}
        <main className="flex-1 p-6 overflow-y-auto">
            <Outlet />
        </main>

      </div>
    </div>
  );
};

export default ProtectedRouter;