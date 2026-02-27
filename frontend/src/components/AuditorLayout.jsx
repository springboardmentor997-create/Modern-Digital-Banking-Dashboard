import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard,
  Users, 
  CreditCard, 
  ArrowUpDown, 
  FileText,
  Activity,
  Eye,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AuditorLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isDark, setIsDark] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainItems = [
    { path: '/auditor', label: 'Audit Overview', icon: LayoutDashboard },
    { path: '/auditor/users', label: 'Users Audit', icon: Users },
    { path: '/auditor/accounts', label: 'Accounts Audit', icon: CreditCard },
    { path: '/auditor/transactions', label: 'Transactions Audit', icon: ArrowUpDown },
    { path: '/auditor/logs', label: 'System Logs', icon: FileText },
  ];

  const accountItems = [
    { path: '/auditor/reports', label: 'Audit Reports', icon: Activity },
    { path: '/auditor/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

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
              ? 'bg-gray-700 text-white'
              : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
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
    <div className="flex h-screen bg-[#1a1b1e] relative overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Auditor Sidebar */}
      <div className={`${isExpanded ? 'w-64' : 'w-16'} h-screen fixed left-0 top-0 transition-all duration-300 flex flex-col bg-gradient-to-b from-purple-800 via-blue-800 to-purple-800 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 z-50`}>
        {/* Header */}
        <div className="p-4 border-b border-purple-900/30">
          <div className="flex items-center justify-between">
            {isExpanded && (
              <div>
                <h1 className="text-white font-bold text-lg">Auditor Portal</h1>
                <p className="text-gray-400 text-xs">Read-Only Access</p>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors hidden lg:block"
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
            <div className="border-t border-gray-700"></div>
          </div>
          
          {/* Account Section */}
          {isExpanded && (
            <div className="mb-3">
              <h3 className="text-gray-500 text-xs font-semibold uppercase tracking-wider px-3">
                REPORTS
              </h3>
            </div>
          )}
          
          {accountItems.map((item) => (
            <NavItem key={item.path} item={item} showTooltip={true} />
          ))}
        </nav>

        {/* Theme Toggle */}
        <div className="p-3 border-t border-gray-800">
          <button
            onClick={() => setIsDark(!isDark)}
            className="flex items-center w-full px-3 py-2.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
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
        <header className="bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 h-16 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden mr-4 p-2 rounded-xl text-white hover:bg-white/10 transition-all duration-200"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-white">
              Auditor Dashboard
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 px-3 py-2 bg-white/10 rounded-xl">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-white">
                Welcome, {user?.name || 'Auditor'}
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
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AuditorLayout;