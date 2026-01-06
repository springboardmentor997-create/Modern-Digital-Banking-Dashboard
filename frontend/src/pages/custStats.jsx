import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Loader,
  Target,
  Wallet,
} from "lucide-react";

import { getAccounts } from "../api/accounts";
import { getTransactions } from "../api/transactions";
import { getBudgets } from "../api/budgets";

const Stats = () => {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const accountsData = await getAccounts();
      setAccounts(accountsData);

      if (accountsData.length > 0) {
        const txData = await getTransactions(accountsData[0].id);
        setTransactions(txData);
      }

      const budgetData = await getBudgets();
      setBudgets(budgetData.slice(0,4));
    } catch (err) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = accounts.reduce(
    (sum, acc) => sum + Number(acc.balance || 0),
    0
  );

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-600 font-medium">Loading your financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <p className="text-red-600 font-semibold text-lg">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Financial Dashboard</h1>
        <p className="text-gray-600 text-lg">Manage your finances with real-time insights</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Total Balance Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-blue-50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative bg-gradient-to-br from-blue-50 to-blue-100 text-gray-900 p-8 rounded-2xl shadow-md hover:shadow-lg overflow-hidden border border-blue-200">
            <div className="absolute top-0 right-0 opacity-5">
              <Wallet className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <p className="text-sm opacity-70 font-medium text-gray-700">Total Balance</p>
              <p className="text-xl font-bold mt-4 text-gray-900">₹{totalBalance.toFixed(2)}</p>
              <div className="flex items-center gap-2 mt-4 text-sm opacity-80 text-gray-700">
                <TrendingUp className="w-4 h-4" />
                <span>{accounts.length} account{accounts.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Income Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-100 to-emerald-50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative bg-gradient-to-br from-green-50 to-emerald-100 text-gray-900 p-8 rounded-2xl shadow-md hover:shadow-lg overflow-hidden border border-green-200">
            <div className="absolute top-0 right-0 opacity-5">
              <ArrowUpRight className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <p className="text-sm opacity-70 font-medium text-gray-700">Total Income</p>
              <p className="text-xl font-bold mt-4 text-green-600">₹{totalIncome.toFixed(2)}</p>
              <div className="flex items-center gap-2 text-sm mt-4 opacity-80 text-gray-700">
                <ArrowUpRight className="w-4 h-4" />
                <span>{transactions.filter((t) => t.type === "income").length} transactions</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses Card */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-100 to-pink-50 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative bg-gradient-to-br from-red-50 to-pink-100 text-gray-900 p-8 rounded-2xl shadow-md hover:shadow-lg overflow-hidden border border-red-200">
            <div className="absolute top-0 right-0 opacity-5">
              <ArrowDownRight className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <p className="text-sm opacity-70 font-medium text-gray-700">Total Expenses</p>
              <p className="text-xl font-bold mt-4 text-red-600">₹{totalExpense.toFixed(2)}</p>
              <div className="flex items-center gap-2 text-sm mt-4 opacity-80 text-gray-700">
                <ArrowDownRight className="w-4 h-4" />
                <span>{transactions.filter((t) => t.type === "expense").length} transactions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
          <Target className="w-7 h-7 text-blue-600" />
          Budget Overview
        </h2>

        {budgets.length ? (
          <div className="grid md:grid-cols-2 gap-6">
            {budgets.map((b) => {
              const spent = Number(b.spent_amount || 0);
              const limit = Number(b.limit_amount || 0);
              const percent = limit ? Math.min((spent / limit) * 100, 100) : 0;
              const remaining = limit - spent;

              return (
                <div
                  key={b.id}
                  className="group bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 hover:border-gray-300 hover:shadow-md transition duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold text-gray-900 text-lg">{b.category}</h3>
                    <span
                      className={`text-sm font-bold px-3 py-1 rounded-full ${
                        percent >= 100
                          ? "bg-red-100 text-red-700"
                          : percent >= 80
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {percent.toFixed(0)}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="w-full bg-gray-300 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          percent >= 100
                            ? "bg-red-500"
                            : percent >= 80
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-gray-700">
                      <span>Spent</span>
                      <span className="font-semibold text-gray-900">₹{spent.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                      <span>Limit</span>
                      <span className="font-semibold text-gray-900">₹{limit.toFixed(2)}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-300 flex justify-between">
                      <span className="text-gray-600">Remaining</span>
                      <span
                        className={`font-semibold ${
                          remaining >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {remaining >= 0 ? `₹${remaining.toFixed(2)}` : `-₹${Math.abs(remaining).toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-12">No budgets configured</p>
        )}
      </div>
    </div>
  );
};

export default Stats;