import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Navbar from '../components/Navbar'; 
import Loader from '../components/Loader';
import { getAccounts } from '../api/accounts';
import { getTransactions } from '../api/transactions';
import { getBudgets } from '../api/budgets';
import { getDashboardStats } from '../api/dashboard';
import { getRewards } from '../api/rewards';
import { 
  AlertCircle, 
  DollarSign,
  TrendingUp, 
  TrendingDown,
  CreditCard,
  Target,
  Calendar,
  Gift,
  Star
} from 'lucide-react';

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({});
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Debug authentication before making API calls
        
        const [accountsData, transactionsData, budgetsData, statsData, rewardsData] = await Promise.all([
          getAccounts().catch(() => []),
          getTransactions().catch(() => []),
          getBudgets().catch(() => []),
          getDashboardStats().catch(() => ({})),
          getRewards().catch(() => [])
        ]);
        
        setAccounts(accountsData);
        setTransactions(transactionsData);
        setBudgets(budgetsData);
        setDashboardStats(statsData);
        setRewards(Array.isArray(rewardsData) ? rewardsData.filter(r => r.given_by_admin) : []);
        console.log('Admin rewards loaded:', rewardsData.filter(r => r.given_by_admin));
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'credit':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'debit':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <DollarSign className="w-4 h-4 text-blue-600" />;
    }
  };

  const StatCard = ({ title, value, icon: Icon, gradient }) => (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-blue-200 p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-r ${gradient} shadow-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  if (loading) return <Loader />;

  const totalIncome = transactions
    .filter(t => t.txn_type === 'credit')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const totalExpense = transactions
    .filter(t => t.txn_type === 'debit')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const totalBalance = accounts.reduce((sum, acc) => sum + (parseFloat(acc.balance) || 0), 0);

  // Prepare pie chart data for budgets
  const budgetChartData = budgets.length > 0 ? budgets.map((budget, index) => {
    const spent = (budget.spent_amount ?? budget.spent) || 0;
    const limit = (budget.limit_amount ?? budget.amount) || 1;
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    return {
      name: budget.category || budget.name || `Budget ${index + 1}`,
      value: spent,
      limit: limit,
      fill: colors[index % colors.length],
      percentage: limit > 0 ? Math.round((spent / limit) * 100) : 0
    };
  }) : [];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${((percent || 0) * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200"> 
      <Navbar title="Dashboard" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900">Dashboard</h1>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-blue-200">
            <Calendar size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
              })}
            </span>
          </div>
        </div>
        
        {error && (
            <div className="bg-red-50/80 backdrop-blur-sm border-l-4 border-red-500 p-4 mb-6 rounded-r-xl">
                <p className="text-red-700 font-medium">{error}</p>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Balance"
            value={formatCurrency(totalBalance || 0)}
            icon={DollarSign}
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            title="This Month Income"
            value={formatCurrency(dashboardStats.income_this_month || totalIncome || 0)}
            icon={TrendingUp}
            gradient="from-green-500 to-green-600"
          />
          <StatCard
            title="This Month Expenses"
            value={formatCurrency(dashboardStats.expenses_this_month || totalExpense || 0)}
            icon={TrendingDown}
            gradient="from-red-500 to-red-600"
          />
          <StatCard
            title="Total Accounts"
            value={accounts.length || 0}
            icon={CreditCard}
            gradient="from-purple-500 to-purple-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Recent Transactions</h2>
              <button onClick={() => navigate('/app/transactions')} className="text-blue-600 hover:text-purple-600 text-sm font-medium transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {transactions.length > 0 ? (
                transactions.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.txn_type)}
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">{formatDate(transaction.txn_date)}</p>
                      </div>
                    </div>
                    <div className={`font-semibold ${
                      transaction.txn_type === 'credit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.txn_type === 'credit' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No transactions yet</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Budget Overview</h2>
              <button onClick={() => navigate('/app/budgets')} className="text-blue-600 hover:text-purple-600 text-sm font-medium transition-colors">
                Manage Budgets
              </button>
            </div>
            
            {budgets.length > 0 ? (
              <div className="space-y-4">
                {/* Pie Chart */}
                <div className="h-64 mb-4" style={{ minHeight: '256px', minWidth: '200px' }}>
                  <ResponsiveContainer width="100%" height={256}>
                    <PieChart>
                      <Pie
                        data={budgetChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {budgetChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${formatCurrency(value)} spent of ${formatCurrency(props.payload.limit)}`,
                          props.payload.name
                        ]}
                        labelFormatter={() => 'Budget Details'}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Budget Legend with Values */}
                <div className="grid grid-cols-1 gap-2">
                  {budgetChartData.map((budget, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: budget.fill }}
                        ></div>
                        <span className="text-sm font-medium text-gray-700">{budget.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(budget.value)} / {formatCurrency(budget.limit)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {budget.percentage}% used
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No budgets set up</p>
              </div>
            )}
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-100 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Admin Rewards</h2>
              <button onClick={() => navigate('/app/rewards')} className="text-blue-600 hover:text-purple-600 text-sm font-medium transition-colors">
                View All
              </button>
            </div>
            <div className="space-y-3">
              {rewards.length > 0 ? (
                rewards.slice(0, 3).map((reward) => (
                  <div key={reward.id} className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Gift className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">{reward.title || 'Special Reward'}</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      {reward.admin_message || reward.description || 'Congratulations!'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-purple-600">+{reward.points_balance || reward.points || 0} points</span>
                      <Star className="w-4 h-4 text-yellow-500" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Gift className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No rewards yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-blue-100 p-6">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/app/transactions')}
              className="p-4 text-center bg-white/60 border border-blue-100 rounded-xl hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">Add Transaction</span>
            </button>
            <button 
              onClick={() => navigate('/app/accounts')}
              className="p-4 text-center bg-white/60 border border-blue-100 rounded-xl hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">Add Account</span>
            </button>
            <button 
              onClick={() => navigate('/app/budgets')}
              className="p-4 text-center bg-white/60 border border-blue-100 rounded-xl hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">Create Budget</span>
            </button>
            <button 
              onClick={() => navigate('/app/insights')}
              className="p-4 text-center bg-white/60 border border-blue-100 rounded-xl hover:shadow-lg transition-all"
            >
              <div className="w-12 h-12 mx-auto mb-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-900">View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;