import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutGrid, ArrowRightLeft, PieChart, Receipt, Gift, 
  Bell, Settings, HelpCircle, LogOut, Menu, Wallet, TrendingUp, AlertTriangle, Shield, Users, Eye, Search, Camera, Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';

const Sidebar = () => {
  const location = useLocation();
  const { logout, user } = useAuth();
  
  const { 
    isExpanded, 
    toggleSidebar
  } = useSidebar();

  const isActive = (path) => location.pathname === path;

  // Role-based menu configuration
  const getMenuItems = () => {
    const userRole = user?.role;
    
    if (userRole === 'admin') {
      return {
        main: [
          { path: '/app/admin', label: 'Admin Dashboard', icon: LayoutGrid },
          { path: '/app/alerts', label: 'System Alerts', icon: AlertTriangle },
        ],
        account: [
          { path: '/app/profile', label: 'Profile Settings', icon: Settings },
          { path: '/app/support', label: 'Support', icon: HelpCircle },
        ]
      };
    }
    
    if (userRole === 'auditor') {
      return {
        main: [
          { path: '/app/auditor', label: 'Audit Dashboard', icon: Eye },
        ],
        account: [
          { path: '/app/profile', label: 'Profile Settings', icon: Settings },
          { path: '/app/support', label: 'Support', icon: HelpCircle },
        ]
      };
    }
    
    if (userRole === 'support') {
      return {
        main: [
          { path: '/app/support', label: 'Support Dashboard', icon: Search },
        ],
        account: [
          { path: '/app/profile', label: 'Profile Settings', icon: Settings },
        ]
      };
    }
    
    // Default user menu
    return {
      main: [
        { path: '/app/dashboard', label: 'Dashboard', icon: LayoutGrid },
        { path: '/app/accounts', label: 'Accounts', icon: Wallet },
        { path: '/app/transactions', label: 'Transactions', icon: ArrowRightLeft },
        { path: '/app/budgets', label: 'Budgets', icon: PieChart },
        { path: '/app/bills', label: 'Bills', icon: Receipt },
        { path: '/app/rewards', label: 'Rewards', icon: Gift },
        { path: '/app/insights', label: 'Insights', icon: TrendingUp },
        { path: '/app/expense-tracker', label: 'Expense Tracker', icon: Camera },
        { path: '/app/alerts', label: 'Alerts', icon: AlertTriangle },
      ],
      account: [
        { path: '/app/profile', label: 'Profile', icon: Settings },
        { path: '/app/kyc', label: 'KYC Status', icon: Shield },
        { path: '/app/support', label: 'Support', icon: HelpCircle },
      ]
    };
  };

  const menuItems = getMenuItems();

  // Helper Component for Links
  const NavLink = ({ item }) => {
    const Icon = item.icon;
    const active = isActive(item.path);
    
    return (
      <Link
        to={item.path}
        className={`
          flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 mb-1 group
          ${active 
            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg shadow-blue-500/25'
            : 'text-gray-300 hover:bg-gradient-to-r hover:from-blue-500/20 hover:to-purple-500/20 hover:text-white'}
          ${!isExpanded ? 'justify-center' : ''} 
        `}
      >
        <Icon 
          size={20} 
          strokeWidth={2} 
          className={active ? 'text-white' : 'text-gray-400 group-hover:text-blue-400'}
        />
        
        <span 
          className={`
            text-sm whitespace-nowrap overflow-hidden transition-all duration-300
            ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0 hidden'}
          `}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  return (
    <aside 
      className={`
        h-screen flex flex-col sticky top-0 z-30 
        transition-all duration-300 ease-in-out font-sans flex-shrink-0
        bg-gradient-to-b from-blue-800 via-purple-800 to-blue-800
        ${isExpanded ? 'w-64 px-4' : 'w-20 px-2'} 
      `}
    >
      {/* 1. HEADER & LOGO */}
      <div className={`flex items-center mb-6 pt-6 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
        {isExpanded && (
          <div className="flex items-center gap-2">
            <img src="/bank_logo.png" alt="ASUNova" className="w-8 h-8 object-contain" />
            <span className="text-lg font-bold text-white">ASUNova</span>
          </div>
        )}
        {!isExpanded && (
          <img src="/bank_logo.png" alt="ASUNova" className="w-8 h-8 object-contain mb-2" />
        )}
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-white/10 text-white transition-all focus:outline-none"
          title={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          <Menu size={20} />
        </button>
      </div>

      {/* 2. SCROLLABLE MENU */}
      <nav className="flex-1 overflow-y-auto no-scrollbar space-y-2">
        <div>
           {menuItems.main.map((item) => <NavLink key={item.path} item={item} />)}
        </div>

        <div>
           {isExpanded && (
             <p className="px-3 text-xs font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wider mb-3 mt-6">
               Account
             </p>
           )}
           {!isExpanded && <div className="h-px bg-gradient-to-r from-blue-400/30 to-purple-400/30 w-full my-4"></div>}

           {menuItems.account.map((item) => <NavLink key={item.path} item={item} />)}
           
           <button
             onClick={logout}
             className={`
               flex items-center gap-3 px-3 py-3 w-full text-left text-gray-300 hover:bg-gradient-to-r hover:from-red-500/20 hover:to-pink-500/20 hover:text-red-400 rounded-xl transition-all mt-2
               ${!isExpanded ? 'justify-center' : ''}
             `}
           >
             <LogOut size={20} strokeWidth={2} />
             {isExpanded && <span className="text-sm font-medium">Logout</span>}
           </button>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;