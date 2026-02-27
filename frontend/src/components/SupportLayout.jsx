import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Users, CreditCard, ArrowUpDown, AlertTriangle, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const SupportLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const supportMenuItems = [
    { path: '/support', label: 'Support Dashboard', icon: Users },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`w-64 bg-gradient-to-b from-yellow-500 to-orange-500 shadow-lg fixed left-0 top-0 h-full transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0 z-50`}>
        <div className="p-6 border-b border-yellow-600/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Support Portal</h1>
              <p className="text-sm text-yellow-100">Customer Assistance</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white hover:bg-white/20 p-2 rounded-lg transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <nav className="mt-6 px-3">
          {supportMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center px-4 py-3 mb-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-white/20 text-white'
                    : 'text-yellow-100 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-yellow-600/30">
          <div className="bg-yellow-600/20 rounded-lg p-3">
            <p className="text-xs text-yellow-100 font-medium">READ-ONLY ACCESS</p>
            <p className="text-xs text-yellow-200">No financial modifications allowed</p>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:ml-0">
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4 p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-lg font-semibold text-gray-800">Support Dashboard</h2>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name || 'Support'}</span>
              <button onClick={handleLogout} className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SupportLayout;