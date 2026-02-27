import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users, 
  CreditCard, 
  ArrowUpDown, 
  ShieldCheck, 
  Gift,
  Bell,
  Activity,
  Send,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Menu,
  X,
  Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDark, setIsDark] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainItems = [
    { path: '/admin', label: 'System Overview', icon: LayoutDashboard },
    { path: '/admin/users', label: 'User Management', icon: Users },
    { path: '/admin/accounts', label: 'Account Management', icon: CreditCard },
    { path: '/admin/transactions', label: 'Transactions', icon: ArrowUpDown },
    { path: '/admin/kyc', label: 'KYC Verification', icon: ShieldCheck },
    { path: '/admin/rewards', label: 'Rewards', icon: Gift },
    { path: '/admin/alerts', label: 'Alerts & Notifications', icon: Bell },
  ];

  const accountItems = [
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  // Get current page title based on route
  const getCurrentPageTitle = () => {
    const allItems = [...mainItems, ...accountItems];
    const currentItem = allItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.label : 'Admin Dashboard';
  };

  const NavItem = ({ item, showTooltip = false }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    
    return (
      <div className="relative group">
        <Link
          to={item.path}
          onClick={() => setSidebarOpen(false)}
          className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
            active
              ? isDark 
                ? 'bg-gray-700 text-white' 
                : 'bg-purple-600 text-white'
              : isDark
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                : 'text-purple-200 hover:text-white hover:bg-purple-600'
          }`}
        >
          <Icon size={20} className="flex-shrink-0" />
          {isExpanded && (
            <span className="ml-3 font-medium text-sm">{item.label}</span>
          )}
        </Link>
        
        {!isExpanded && showTooltip && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {item.label}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`flex h-screen relative overflow-hidden ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Admin Sidebar */}
      <div className={`${isExpanded ? 'w-64' : 'w-16'} h-screen fixed left-0 top-0 transition-all duration-300 flex flex-col ${
        isDark 
          ? 'bg-gradient-to-b from-gray-800 via-gray-900 to-gray-800' 
          : 'bg-gradient-to-b from-blue-400 via-purple-500 to-blue-500'
      } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 z-50`}>
        {/* Header */}
        <div className={`p-4 border-b ${
          isDark ? 'border-gray-700' : 'border-purple-600/30'
        }`}>
          <div className="flex items-center justify-between">
            {isExpanded && (
              <div>
                <h1 className="text-white font-bold text-lg">Admin Portal</h1>
                <p className="text-gray-400 text-xs">Banking System</p>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`p-1.5 rounded-lg transition-colors hidden lg:block ${
                  isDark 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                    : 'text-purple-200 hover:text-white hover:bg-purple-600'
                }`}
              >
                {isExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
              </button>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-white/90 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {mainItems.map((item) => (
            <NavItem key={item.path} item={item} showTooltip={true} />
          ))}
          
          {/* Separator */}
          <div className="py-4">
            <div className={`border-t ${
              isDark ? 'border-gray-700' : 'border-purple-600'
            }`}></div>
          </div>
          
          {/* Account Section */}
          {isExpanded && (
            <div className="mb-3">
              <h3 className={`text-xs font-semibold uppercase tracking-wider px-3 ${
                isDark ? 'text-gray-500' : 'text-purple-300'
              }`}>
                ACCOUNT
              </h3>
            </div>
          )}
          
          {accountItems.map((item) => (
            <NavItem key={item.path} item={item} showTooltip={true} />
          ))}
        </nav>

        {/* Theme Toggle */}
        <div className={`p-3 border-t ${
          isDark ? 'border-gray-700' : 'border-purple-600'
        }`}>
          <button
            onClick={() => setIsDark(!isDark)}
            className={`flex items-center w-full px-3 py-2.5 rounded-lg transition-colors ${
              isDark 
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                : 'text-purple-200 hover:text-white hover:bg-purple-600'
            }`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            {isExpanded && (
              <span className="ml-3 font-medium text-sm">
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className={`h-16 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-sm ${
          isDark 
            ? 'bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800' 
            : 'bg-gradient-to-r from-blue-400 via-purple-500 to-blue-500'
        }`}>
        <div className="flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden mr-4 p-2 rounded-xl text-white hover:bg-white/10 transition-all duration-200"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="text-xl font-bold text-white">
            {getCurrentPageTitle()}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-xl">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-white">
              Welcome, {user?.name || 'Admin'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center px-4 py-2 text-sm font-medium text-white hover:bg-red-500/80 rounded-xl transition-all duration-200 hover:scale-105"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </button>
        </div>
      </header>

        {/* Page Content */}
        <main className={`flex-1 overflow-y-auto ${
          isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;