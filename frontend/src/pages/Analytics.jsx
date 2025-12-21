import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Calendar, Download } from 'lucide-react';
import axiosClient from '../utils/axiosClient';

export default function Analytics() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    balance: 45320.50,
    monthlySpending: 12450.00,
    monthlyIncome: 65000.00,
    savingsRate: 22
  });
  const [timeframe, setTimeframe] = useState('monthly');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
    } else {
      setIsLoggedIn(true);
      fetchAnalytics();
    }
  }, [navigate]);

  const fetchAnalytics = async () => {
    try {
      // Replace with your actual API endpoint
      // const response = await axiosClient.get('/analytics/dashboard');
      // setAnalytics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  const spendingCategories = [
    { name: 'Groceries', amount: 3200, percentage: 25, color: 'bg-blue-600' },
    { name: 'Utilities', amount: 2100, percentage: 17, color: 'bg-green-600' },
    { name: 'Entertainment', amount: 2850, percentage: 23, color: 'bg-purple-600' },
    { name: 'Transportation', amount: 2300, percentage: 18, color: 'bg-red-600' },
    { name: 'Other', amount: 2000, percentage: 17, color: 'bg-yellow-600' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-2">Financial Analytics</h1>
            <p className="text-gray-600">Monitor your spending and financial health</p>
          </div>
          <div className="flex gap-2">
            {['weekly', 'monthly', 'yearly'].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-4 py-2 rounded-lg font-semibold capitalize transition-colors ${
                  timeframe === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Balance Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Account Balance</p>
                <h3 className="text-4xl font-bold text-gray-900">₹{analytics.balance.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-green-600 text-sm mt-4">↑ 5.2% from last month</p>
          </div>

          {/* Monthly Income */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Monthly Income</p>
                <h3 className="text-4xl font-bold text-gray-900">₹{analytics.monthlyIncome.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4">On track</p>
          </div>

          {/* Monthly Spending */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Monthly Spending</p>
                <h3 className="text-4xl font-bold text-gray-900">₹{analytics.monthlySpending.toLocaleString()}</h3>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-green-600 text-sm mt-4">↓ 15% from last month</p>
          </div>

          {/* Savings Rate */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Savings Rate</p>
                <h3 className="text-4xl font-bold text-gray-900">{analytics.savingsRate}%</h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <PieChart className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-green-600 text-sm mt-4">Great progress!</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Spending by Category */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Spending by Category</h2>
            <div className="space-y-6">
              {spendingCategories.map((category, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 font-medium">{category.name}</span>
                    <span className="text-gray-900 font-bold">₹{category.amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${category.color} h-3 rounded-full transition-all duration-500`}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">{category.percentage}% of total</p>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Financial Insights</h2>
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-600 font-bold text-xl">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Reduced spending</p>
                  <p className="text-gray-600 text-sm">You're spending 15% less this month</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-blue-600 font-bold text-xl">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Strong savings rate</p>
                  <p className="text-gray-600 text-sm">Your savings rate is 22% - great progress!</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <span className="text-purple-600 font-bold text-xl">✓</span>
                <div>
                  <p className="font-semibold text-gray-900">Investment opportunity</p>
                  <p className="text-gray-600 text-sm">Consider investing your surplus in our plans</p>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                <span className="text-orange-600 font-bold text-xl">!</span>
                <div>
                  <p className="font-semibold text-gray-900">High entertainment spending</p>
                  <p className="text-gray-600 text-sm">Entertainment is 23% of your budget</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-bold mb-2">Download Your Report</h3>
            <p className="opacity-90">Get detailed insights exported as PDF</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-bold rounded-lg hover:bg-gray-100 transition-colors">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}
