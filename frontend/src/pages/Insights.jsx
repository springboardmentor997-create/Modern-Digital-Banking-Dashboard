import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, PieChart, Download, Calendar } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  AreaChart, Area 
} from 'recharts';
import Navbar from '../components/Navbar';
import { getInsights, getSpendingAnalysis, getCategoryBreakdown, getMonthlyTrends } from '../api/insights';
import { getTransactions } from '../api/transactions';
import axiosClient from '../api/client';

const Insights = () => {
  const [insights, setInsights] = useState({
    cashFlow: null,
    topMerchants: [],
    burnRate: null,
    categoryBreakdown: [],
    savingsTrend: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      // Try to get insights from API first, then fallback to calculating from transactions
      const [insightsResult, spending, categories, trends, transactions] = await Promise.all([
        getInsights().catch(() => null),
        getSpendingAnalysis().catch(() => ({ daily_burn_rate: 0, projected_monthly_spend: 0, top_merchants: [] })),
        getCategoryBreakdown().catch(() => []),
        getMonthlyTrends().catch(() => []),
        getTransactions().catch(() => [])
      ]);

      let cashFlow = insightsResult;
      
      // If insights API failed, calculate from transactions
      if (!cashFlow && transactions.length > 0) {
        const income = transactions
          .filter(t => t.transaction_type === 'credit')
          .reduce((sum, t) => sum + (t.amount || 0), 0);
        
        const expenses = transactions
          .filter(t => t.transaction_type === 'debit')
          .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0);
        
        const net_flow = income - expenses;
        const savings_rate = income > 0 ? (net_flow / income) * 100 : 0;
        
        cashFlow = { income, expenses, net_flow, savings_rate };
      }
      
      // Default values if no data
      if (!cashFlow) {
        cashFlow = { income: 0, expenses: 0, net_flow: 0, savings_rate: 0 };
      }

      setInsights({
        cashFlow,
        topMerchants: spending.top_merchants || [],
        burnRate: {
          daily_burn_rate: spending.daily_burn_rate || 0,
          projected_monthly_spend: spending.projected_monthly_spend || 0
        },
        categoryBreakdown: categories,
        savingsTrend: trends
      });
    } catch (error) {
      console.error('Failed to fetch insights:', error);
      // Set default values on error
      setInsights({
        cashFlow: { income: 0, expenses: 0, net_flow: 0, savings_rate: 0 },
        topMerchants: [],
        burnRate: { daily_burn_rate: 0, projected_monthly_spend: 0 },
        categoryBreakdown: [],
        savingsTrend: []
      });
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (type) => {
    try {
      const response = await axiosClient.get(`/api/export/financial-summary/${type}`, {
        responseType: 'blob'
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `financial-report.${type}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export feature is not available at the moment');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Formatting cash flow data for the Bar Chart
  const cashFlowChartData = [
    {
      name: 'Cash Flow',
      Income: insights.cashFlow?.income || 0,
      Expenses: insights.cashFlow?.expenses || 0,
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <Navbar title="Financial Insights" />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
          <h1 className="text-3xl font-bold text-gray-900">Financial Insights</h1>
          <p className="text-gray-500 text-sm">Detailed analysis of your spending and savings</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportReport('pdf')}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={16} /> Export PDF
          </button>
          <button
            onClick={() => exportReport('csv')}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      {/* Top Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cash Flow Graph Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">Income vs Expenses</h3>
          </div>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={cashFlowChartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" hide />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Burn Rate Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="text-blue-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">Burn Rate</h3>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Daily Average</p>
              <p className="text-2xl font-bold text-gray-900">₹{insights.burnRate?.daily_burn_rate?.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Projected Monthly</p>
              <p className="text-xl font-semibold text-gray-700">₹{insights.burnRate?.projected_monthly_spend?.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Savings Rate Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
          <PieChart className="text-purple-600 mb-2" size={32} />
          <h3 className="text-lg font-semibold text-gray-800">Savings Rate</h3>
          <div className="text-5xl font-extrabold text-purple-600 my-2">
            {insights.cashFlow?.savings_rate?.toFixed(1)}%
          </div>
          <p className="text-gray-500 text-sm">of your income is saved</p>
        </div>
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Savings Trend Graph */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="text-blue-500" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">Monthly Savings Trend</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height={256}>
              <AreaChart data={insights.savingsTrend} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="savings" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSavings)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-6 text-gray-800">Spending Breakdown</h3>
          <div className="space-y-5">
            {insights.categoryBreakdown?.length > 0 ? (
              insights.categoryBreakdown.map((category, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{category.category}</span>
                    <span className="text-gray-900 font-bold">₹{category.amount?.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-400 py-10">No category data found</p>
            )}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Insights;