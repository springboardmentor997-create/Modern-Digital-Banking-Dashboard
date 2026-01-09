import React, { useState, useEffect } from 'react';
import { Users, CreditCard, DollarSign, TrendingUp, Bell, Settings, BarChart3, Activity, AlertCircle, CheckCircle, Clock, ArrowLeftCircle, ArrowRightCircle, LogOut, Replace, Database, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Transactions from './Transactions';
import Rewards from './Rewards';
import { useAuth } from "../context/AuthContext.jsx";
import UserManagement from './Userlist.jsx';
import Setting from './Settings.jsx';
import Load from '../components/Loader.jsx';
import { getUsers } from '../api/users.js';
import { getAccounts } from '../api/accounts.js';
import { getTransactions } from '../api/transactions.js';
import { getBills } from '../api/bills.js';
import { fetchRewards } from '../api/rewards.js';
import AdminAnalytics from './AdminAnalytics.jsx';
import CurrencyConverter from './CurrConv.jsx';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [users, setUsers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [bills, setBills] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  function useIsMdUp() {
    const [isMdUp, setIsMdUp] = useState(
      window.matchMedia("(min-width: 768px)").matches
    );

    useEffect(() => {
      const media = window.matchMedia("(min-width: 768px)");
      
      const handleChange = (e) => {
        setIsMdUp(e.matches);
      };

      setIsMdUp(media.matches);
      media.addListener(handleChange);

      return () => media.removeListener(handleChange);
    }, []);

    return isMdUp;
  }

  const isMdUp = useIsMdUp();
  const isMobile = !isMdUp;

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [usersData, accountsData, billsData, rewardsData] = await Promise.all([
        getUsers().catch(() => []),
        getAccounts().catch(() => []),
        getBills().catch(() => []),
        fetchRewards().catch(() => [])
      ]);

      setUsers(usersData || []);
      setAccounts(accountsData || []);
      setBills(billsData || []);
      setRewards(rewardsData || []);

      if (accountsData && accountsData.length > 0) {
        try {
          const txData = await getTransactions(accountsData[0].id);
          setTransactions(txData || []);
        } catch (err) {
        }
      }

      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalUsers = users.length;
    const activeAccounts = accounts.length;
    const totalTransactions = transactions.reduce((sum, t) => sum + Number(t.amount || 0), 0);
    const activeBudgets = bills.length;

    const userChange = ((totalUsers / 100) * 12.5).toFixed(1);
    const accountChange = ((activeAccounts / 100) * 8.2).toFixed(1);
    const transactionChange = ((totalTransactions / 100)*0.00355 ).toFixed(1);
    const budgetChange = ((activeBudgets / 100) * 5.7).toFixed(1);

    return [
      { 
        label: 'Total Users', 
        value: totalUsers.toLocaleString(), 
        change: `+${userChange}%`, 
        icon: Users, 
        color: 'bg-blue-100 text-blue-600' 
      },
      { 
        label: 'Active Accounts', 
        value: activeAccounts.toLocaleString(), 
        change: `+${accountChange}%`, 
        icon: CreditCard, 
        color: 'bg-green-100 text-green-600' 
      },
      { 
        label: 'Total Transactions', 
        value: `₹${(totalTransactions / 1000000).toFixed(1)}M`, 
        change: `+${transactionChange}%`, 
        icon: DollarSign, 
        color: 'bg-purple-100 text-purple-600' 
      },
      { 
        label: 'Active Budgets', 
        value: activeBudgets.toLocaleString(), 
        change: `+${budgetChange}%`, 
        icon: TrendingUp, 
        color: 'bg-orange-100 text-orange-600' 
      },
    ];
  };

  const calculateModuleUsage = () => {
    return [
      { 
        module: 'Accounts & Transactions', 
        users: transactions.length, 
        percentage: Math.min((transactions.length / 100) * 100, 100) 
      },
      { 
        module: 'Budgeting', 
        users: bills.length, 
        percentage: Math.min((bills.length / 100) * 100, 100) 
      },
      { 
        module: 'Bills & Reminders', 
        users: Math.ceil(bills.length * 0.75), 
        percentage: 65 
      },
      { 
        module: 'Rewards Tracking', 
        users: rewards.length, 
        percentage: Math.min((rewards.length / 100) * 100, 100) 
      },
    ];
  };

  const recentAlerts = [
    { 
      type: users.length > 1000 ? 'success' : 'info', 
      message: `Total users: ${users.length}`, 
      time: 'now' 
    },
    { 
      type: accounts.length > 500 ? 'success' : 'warning', 
      message: `Active accounts: ${accounts.length}`, 
      time: 'now' 
    },
    { 
      type: transactions.length > 100 ? 'success' : 'info', 
      message: `Transactions processed: ${transactions.length}`, 
      time: 'now' 
    },
    { 
      type: rewards.length > 50 ? 'success' : 'info', 
      message: `Rewards tracked: ${rewards.length}`, 
      time: 'now' 
    },
  ];

  const MenuItem = ({ icon: Icon, label, page }) => (
    <button
      onClick={() => {setActiveTab(page); setSidebarOpen(false)}}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        activeTab === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      {sidebarOpen ? <span className="font-medium">{label}</span> : ""}
    </button>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {calculateStats().map((stat, idx) => {
                const Icon = stat.icon;
                return (
                  <div key={idx} className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/40 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-center justify-between relative z-10">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-green-600 mt-1">{stat.change}</p>
                      </div>
                      <div className={`${stat.color} p-2 rounded-lg shadow-md md:opacity-100`}>
                        <Icon size={20} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
              <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/40 hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Module Usage</h3>
                <div className="space-y-4">
                  {calculateModuleUsage().map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{item.module}</span>
                        <span className="text-gray-600">{item.users} users</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 relative overflow-hidden"
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/40 hover:shadow-xl transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {recentAlerts.map((alert, idx) => {
                  const Icon = alert.type === 'error' ? AlertCircle : 
                               alert.type === 'warning' ? Clock : 
                               alert.type === 'success' ? CheckCircle : Bell;
                  const colorClass = alert.type === 'error' ? 'text-red-600 bg-red-50' : 
                                    alert.type === 'warning' ? 'text-yellow-600 bg-yellow-50' : 
                                    alert.type === 'success' ? 'text-green-600 bg-green-50' : 
                                    'text-blue-600 bg-blue-50';
                  return (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-gray-50/80 rounded-lg hover:bg-gray-100/80 transition-all duration-300 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <div className={`p-2 rounded ${colorClass} shadow-sm relative z-10`}>
                        <Icon size={16} />
                      </div>
                      <div className="flex-1 relative z-10">
                        <p className="text-sm text-gray-900">{alert.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      
      case 'users':
        return <UserManagement users={users}/>
      case 'transactions':
        return <Transactions/>
      case 'rewards':
        return <Rewards users={users}/>
      case 'settings':
        return <Setting/>
      case 'analytics':
        return <AdminAnalytics users = {users}/>
      case 'converter':
        return <CurrencyConverter />
      default:
        return null;
    }
  };

  const navigate = useNavigate();
  const { logoutUser } = useAuth();

  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };

  if (loading) return <Load />;

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <nav className="md:hidden flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-xl shadow border-b overflow-x-auto">
        <MenuItem icon={BarChart3} label="Overview" page="overview" />
        <MenuItem icon={Users} label="Users" page="users" />
        <MenuItem icon={Activity} label="Transactions" page="transactions" />
        <MenuItem icon={Database} label="Analytics" page="analytics" />
        <MenuItem icon={Gift} label="Rewards" page="rewards" />
        <MenuItem icon = {Replace} label = "Currency Converter" page = "converter"/>
        <MenuItem icon={Settings} label="Settings" page="settings" />

        <button
          onClick={handleLogout}
          className="ml-auto flex items-center gap-2 text-red-600 px-3 py-2"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </nav>
      <div className="flex min-h-screen">
        <aside className={`${sidebarOpen ? 'w-64' : 'w-30'} hidden md:block bg-white/60 backdrop-blur-xl shadow-xl border-r border-white/40 transition-all`}>
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
              
              <MenuItem icon={BarChart3} label="Overview" page="overview" />
              <MenuItem icon={Users} label="Users" page="users" />
              <MenuItem icon={Activity} label="Transactions" page="transactions" />
              <MenuItem icon={Database} label="Analytics" page="analytics" />
              <MenuItem icon={Gift} label="Rewards" page="rewards"/>
              <MenuItem icon = {Replace} label = "Currency Converter" page = "converter"/>
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
            {renderContent()}
          </div>
        </main>
        </div>
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;