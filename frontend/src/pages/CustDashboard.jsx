import React, { useState,useEffect } from 'react';
import { Home, CreditCard, ReceiptIndianRupee, Gift, TrendingUp, ArrowLeftCircle,ArrowRightCircle, Plus, ArrowUpRight, ArrowDownRight, RefreshCcw, User, Settings, LogOut, PieChart, IndianRupee, Mail, Phone, MapPin, Lock, Bell, Globe, ImageOff } from 'lucide-react';
import Accounts from './Accounts.jsx';
import Transfer from './transfer.jsx';
import Budgets from './Budgets.jsx';
import { useNavigate } from 'react-router-dom';
import Setting from './Settings.jsx';
import Gifts from './Gifts.jsx';
import Bills from './Bills.jsx';
import { useAuth } from "../context/AuthContext.jsx";
import { getBudgets } from '../api/budgets.js';
import Stats from './custStats.jsx';

export default function Dashboard() {
  const [activePage, setActivePage] = useState('Home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  function useIsMdUp() {
    const [isMdUp, setIsMdUp] = useState(
      window.matchMedia("(max-width: 768px)").matches
    );

    useEffect(() => {
      const media = window.matchMedia("(max-width: 768px)");
      setIsMdUp(media.matches);
      }, []);

    return isMdUp;
  }
  const isMobile = useIsMdUp();

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  const MenuItem = ({ icon: Icon, label, page }) => (
    <button
      onClick={() => {setActivePage(page); setSidebarOpen(false)}}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        activePage === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      {sidebarOpen ? <span className="font-medium">{label}</span> : ""}
    </button>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 ">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-30'} bg-white/60 backdrop-blur-xl shadow-xl border-r border-white/40 transition-all`}>
        <div className="p-6">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="absolute right-0 -translate-y-1/2 translate-x-1/2 z-50 
              bg-blue-700 shadow-lg rounded-full  hover:scale-105 transition">
              {sidebarOpen ? (
                <ArrowLeftCircle className="w-8 h-8 text-white" />
              ) : (
                <ArrowRightCircle className="w-8 h-8 text-white" />
              )}
            </button>
          <nav className="space-y-2">
            
            <MenuItem icon={Home} label="Home" page="Home" />
            <MenuItem icon={CreditCard} label="Accounts" page="accounts" />
            <MenuItem icon={RefreshCcw} label="Transactions" page="transactions" />
            <MenuItem icon={PieChart} label="Budget" page="budget" />
            <MenuItem icon={ReceiptIndianRupee} label="Bills" page="bills" />
            <MenuItem icon={Gift} label="Rewards" page="rewards" />
            <MenuItem icon={Settings} label="Settings" page="settings" />
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t ">
          <button onClick={handleLogout} className='flex text-red-600 hover:bg-red-50 transition-all duration-300'>
            <LogOut className="w-5 h-5 mt-1 ml-4 mr-4" />
            {sidebarOpen ? <span className="font-medium">LogOut</span> : ""}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-10">
          {activePage === 'Home' && <Stats/>}
          {activePage === 'accounts' && <Accounts />}
          {activePage === 'transactions' && <Transfer />}
          {activePage === 'budget' && <Budgets />}
          {activePage === 'bills' && <Bills/>}
          {activePage === 'rewards' && <Gifts/>}
          {activePage === 'settings' && <Setting/>}
        </div>
      </main>
    </div>
  );
}