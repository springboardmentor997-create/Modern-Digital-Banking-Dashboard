import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, DollarSign, PieChart } from 'lucide-react';
import { getTransactions } from "../api/transactions";
import { getAccount } from '../api/accounts';
import Load from '../components/Loader';
export default function Analytics() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [analytics, setAnalytics] = useState({
    balance: 0,
    monthlyIncome: 0,
    monthlySpending: 0,
    savingsRate: 0
  });

  const [timeframe, setTimeframe] = useState('monthly');

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const accountId = localStorage.getItem("selected_account_id");

    if (!token || !accountId) {
      navigate("/login");
      return;
    }

    setIsLoggedIn(true);
    fetchAnalytics(accountId);
  }, []);

  const fetchAnalytics = async (accountId) => {
    try {
      const data = await getTransactions(accountId);
      const account = await getAccount(accountId);
      setTransactions(data);
      calculateAnalytics(data,account.balance);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const calculateAnalytics = (transactions,amount) => {
    const income = transactions
      .filter(t => t.txn_type === "credit")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const expense = transactions
      .filter(t => t.txn_type === "debit")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = amount;

    const savingsRate = income > 0 
      ? Math.round(((income - expense) / income) * 100)
      : 0;

    setAnalytics({
      balance,
      monthlyIncome: income,
      monthlySpending: expense,
      savingsRate
    });
  };

  if (loading) {
    return <Load/>
  }

  if (!isLoggedIn) {
    return null;
  }

  const spendingCategories = transactions
    .filter(tx => tx.txn_type === "debit")
    .reduce((acc, tx) => {
      const category = tx.category || "Others";

      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += Number(tx.amount);
      return acc;
    }, {});

    const categoryData = analytics.monthlySpending > 0
      ? Object.entries(spendingCategories).map(([name, amount]) => ({
          name,
          amount,
          percentage: ((amount / analytics.monthlySpending) * 100).toFixed(1),
        }))
      : [];

  if (loading) {
    return <Load/>
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-2">Financial Analytics</h1>
            <p className="text-gray-600">Monitor your spending and financial health</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-2">Account Balance</p>
                <h3 className="text-4xl font-bold text-gray-900">₹{analytics.balance}</h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

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
          </div>

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
          </div>

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
          </div>
        </div>

        <div className="grid lg:grid gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Spending by Category
            </h2>

            <div className="space-y-6">
              {categoryData.length === 0 && (
                <p className="text-gray-400 text-center">
                  Start spending to see insights 📊
                </p>
              )}

              {categoryData.length > 0  &&
                categoryData.map((category, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>{category.name}</span>
                      <span>₹{category.amount.toLocaleString()}</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>

                    <p className="text-xs text-gray-500 mt-1">
                      {category.percentage}% of total spending
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
