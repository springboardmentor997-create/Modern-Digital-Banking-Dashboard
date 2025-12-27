import React, { useState, useEffect } from 'react';
import { Users, CreditCard, DollarSign, TrendingUp, Bell, Settings, BarChart3, Activity, AlertCircle, CheckCircle, Clock, ArrowLeftCircle, ArrowRightCircle, LogOut, Shield, Database, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Transactions from './Transactions';
import Rewards from './Rewards';
import { getUsers } from '../api/users';
import { useAuth } from "../context/AuthContext.jsx";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError(err);
      }
    };

    fetchUsers();
  }, []);
  
  const isMobile = useIsMdUp();

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const stats = [
    { label: 'Total Users', value: '12,458', change: '+12.5%', icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Accounts', value: '18,924', change: '+8.2%', icon: CreditCard, color: 'bg-green-100 text-green-600' },
    { label: 'Total Transactions', value: '$2.4M', change: '+15.3%', icon: DollarSign, color: 'bg-purple-100 text-purple-600' },
    { label: 'Active Budgets', value: '8,643', change: '+5.7%', icon: TrendingUp, color: 'bg-orange-100 text-orange-600' },
  ];

  const recentAlerts = [
    { type: 'error', message: 'Failed transaction sync for user #4521', time: '5m ago' },
    { type: 'warning', message: 'High API usage detected', time: '12m ago' },
    { type: 'success', message: 'Backup completed successfully', time: '1h ago' },
    { type: 'info', message: 'New feature deployed: Rewards tracking', time: '2h ago' },
  ];

  const userActivity = [
    { module: 'Accounts & Transactions', users: 3245, percentage: 85 },
    { module: 'Budgeting', users: 2876, percentage: 75 },
    { module: 'Bills & Reminders', users: 2134, percentage: 65 },
    { module: 'Rewards Tracking', users: 1567, percentage: 45 },
  ];

  const systemHealth = [
    { service: 'API Gateway', status: 'operational', uptime: '99.9%' },
    { service: 'Transaction Service', status: 'operational', uptime: '99.8%' },
    { service: 'Auth Service', status: 'degraded', uptime: '98.2%' },
    { service: 'Database', status: 'operational', uptime: '100%' },
  ];

  const MenuItem = ({ icon: Icon, label, page }) => (
    <button
      onClick={() => { setActiveTab(page); setSidebarOpen(false); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 relative overflow-hidden group ${
        activeTab === page 
          ? 'bg-blue-600 text-white shadow-lg' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
      <Icon className="w-5 h-5 relative z-10" />
      {sidebarOpen && <span className="font-medium relative z-10">{label}</span>}
    </button>
  );

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => {
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
                      <div className={`${stat.color} p-3 rounded-lg shadow-md md:opacity-100`}>
                        <Icon size={24} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Charts & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Module Usage */}
              <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/40 hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Module Usage</h3>
                <div className="space-y-4">
                  {userActivity.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{item.module}</span>
                        <span className="text-gray-600">{item.users} users</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 relative overflow-hidden"
                          style={{ width: `${item.percentage}%` }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Health */}
              <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/40 hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
                <div className="space-y-3">
                  {systemHealth.map((service, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50/80 rounded-lg hover:bg-gray-100/80 transition-colors duration-300 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                      <div className="flex items-center gap-3 relative z-10">
                        <div className={`w-2 h-2 rounded-full ${
                          service.status === 'operational' ? 'bg-green-500' : 'bg-yellow-500'
                        } shadow-lg`} />
                        <span className="text-sm font-medium text-gray-900">{service.service}</span>
                      </div>
                      <span className="text-xs text-gray-600 relative z-10">{service.uptime}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg p-6 border border-white/40 hover:shadow-xl transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
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
        return (
          <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/40">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">kyc_Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((i) => (
                    <tr key={i.id} className="hover:bg-gray-50/80 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm text-gray-900">USR-{1000 + i.id}</td>
                      <td className="px-6 py-4 text-sm text-gray-900">{i.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">  {i.email}</td>
                      <td className="px-6 py-4">  {i.kyc_status === "verified" ? 
                        (    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Verified </span>  ) : 
                        (    <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"> Unverified </span>  )}</td>
                      <td className="px-6 py-4 text-sm text-center text-gray-600">  {i.phone === "string"? "-" : i.phone}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">  {i.role}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">  {new Date(i.created_at).toLocaleDateString()}</td>
                    </tr>
                    ))}
                  </tbody>

              </table>
            </div>
          </div>
        );

      case 'transactions':
        return <Transactions/>
        case 'Rewards':
            return <Rewards/>
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
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
            
            <MenuItem icon={BarChart3} label="Overview" page="overview" />
            <MenuItem icon={Users} label="Users" page="users" />
            <MenuItem icon={Activity} label="Transactions" page="transactions" />
            <MenuItem icon={Database} label="Analytics" page="analytics" />
            <MenuItem icon={Shield} label="Security" page="security" />
            <MenuItem icon={Gift} label="Rewards" page="Rewards"/>
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-10">
          {renderContent()}
        </div>
      </main>

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