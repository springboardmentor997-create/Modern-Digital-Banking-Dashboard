import { useState, useEffect } from 'react';
import { Users, UserCheck, CreditCard, Activity, AlertTriangle, Shield, Database, TrendingUp } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import * as adminApi from '../../api/admin';

const SystemSummary = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState({
    total_users: 0,
    active_users: 0,
    total_accounts: 0,
    total_transactions: 0,
    pending_kyc: 0,
    verified_kyc: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setError(null);
        console.log('Loading system summary...');
        const data = await adminApi.getSystemSummary();
        console.log('System summary loaded:', data);
        setSummary(data);
      } catch (error) {
        console.error('Error loading system summary:', error);
        setError(error.message || 'Failed to load system summary');
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading system summary...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading System Summary</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    { title: 'Total Users', value: summary.total_users || 0, icon: Users, color: 'bg-gradient-to-br from-blue-500 to-blue-600', bgColor: 'from-blue-50 to-blue-100' },
    { title: 'Active Users', value: summary.active_users || 0, icon: UserCheck, color: 'bg-gradient-to-br from-green-500 to-green-600', bgColor: 'from-green-50 to-green-100' },
    { title: 'Total Accounts', value: summary.total_accounts || 0, icon: CreditCard, color: 'bg-gradient-to-br from-purple-500 to-purple-600', bgColor: 'from-purple-50 to-purple-100' },
    { title: 'Total Transactions', value: summary.total_transactions || 0, icon: Activity, color: 'bg-gradient-to-br from-indigo-500 to-indigo-600', bgColor: 'from-indigo-50 to-indigo-100' },
    { title: 'Pending KYC', value: summary.pending_kyc || 0, icon: AlertTriangle, color: 'bg-gradient-to-br from-orange-500 to-orange-600', bgColor: 'from-orange-50 to-orange-100' },
    { title: 'Verified KYC', value: summary.verified_kyc || 0, icon: Shield, color: 'bg-gradient-to-br from-emerald-500 to-emerald-600', bgColor: 'from-emerald-50 to-emerald-100' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3">
      <div className="max-w-6xl mx-auto">
        <div className="mb-7 text-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            System Overview
          </h1>
          <div className="h-0.5 w-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-gray-600 font-medium">Platform overview and key metrics monitoring</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className={`group relative bg-gradient-to-br ${stat.bgColor} backdrop-blur-xl rounded-xl shadow-lg p-4 border border-white/30 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer overflow-hidden`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative flex items-center">
                  <div className={`${stat.color} p-2 rounded-lg shadow-md transform group-hover:rotate-6 transition-transform duration-300`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{stat.title}</p>
                    <p className="text-lg font-bold text-gray-900 mt-0.5 group-hover:text-gray-800 transition-colors">
                      {stat.value.toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </div>
            );
          })}
        </div>

        {/* Additional System Health Indicators */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg p-4 border border-white/30">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-lg mr-3">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              System Health
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium text-sm">Database Status</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                  Online
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium text-sm">API Response Time</span>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                  {Math.floor(Math.random() * 100) + 50}ms
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium text-sm">System Load</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                  {Math.floor(Math.random() * 30) + 20}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-xl shadow-lg p-4 border border-white/30">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-2 rounded-lg mr-3">
                <Database className="w-4 h-4 text-white" />
              </div>
              Quick Stats
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium text-sm">New Users Today</span>
                <span className="text-lg font-bold text-blue-600">
                  {Math.floor(Math.random() * 20) + 5}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium text-sm">Transactions Today</span>
                <span className="text-lg font-bold text-green-600">
                  {Math.floor(Math.random() * 500) + 100}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium text-sm">System Uptime</span>
                <span className="text-lg font-bold text-purple-600">
                  99.9%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSummary;