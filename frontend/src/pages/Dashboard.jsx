import React, { useState,useEffect } from 'react';
import { Home, CreditCard, ReceiptIndianRupee, Gift, TrendingUp, Calendar, Plus, ArrowUpRight, ArrowDownRight, RefreshCcw, User, Settings, LogOut, PieChart, IndianRupee, Mail, Phone, MapPin, Lock, Bell, Globe, ImageOff } from 'lucide-react';
import Accounts from './Accounts.jsx';
import Transactions from './Transactions.jsx';
import Budgets from './Budgets.jsx';
import { useNavigate } from 'react-router-dom';
import Setting from './Settings.jsx';
import Rewards from './Rewards.jsx';
import Bills from './Bills.jsx';
import { useAuth } from "../context/AuthContext";
import { getBudgets } from '../api/budgets.js';
import { getAccounts } from '../api/accounts.js';
import { getTransactions } from '../api/transactions.js';
import { getBills } from '../api/bills.js';


export default function Dashboard() {
  const [activePage, setActivePage] = useState('Home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [budgetsLoading, setBudgetsLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [billsList, setBillsList] = useState([]);
  const [billsLoading, setBillsLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);

  useEffect(() => {
    fetchAllData();
  }, []);
  const fetchAllData = async () => {
    fetchBudgets();
    fetchAccountsAndTransactions();
    fetchBills();
  }

  const fetchBudgets = async () => {
    try {
      setBudgetsLoading(true);
      const data = await getBudgets();

      const month = new Date().getMonth() + 1;
      const year = new Date().getFullYear();

      const filtered = Array.isArray(data)
        ? data.filter(b => b.month === month && b.year === year)
        : [];

      setBudgets(filtered);
    } catch (err) {
      console.error("Budget fetch error:", err);
      setBudgets([]);
    } finally {
      setBudgetsLoading(false);
    }
  };

  const fetchAccountsAndTransactions = async () => {
    try {
      setAccountsLoading(true);
      const accs = await getAccounts();
      const accountArray = Array.isArray(accs) ? accs : accs.accounts || [];
      setAccounts(accountArray);

      // compute total balance (try fields 'balance' or 'current_balance' or 'amount')
      const total = accountArray.reduce((s, a) => {
        const val = Number(a.balance ?? a.current_balance ?? a.amount ?? 0);
        return s + (isNaN(val) ? 0 : val);
      }, 0);
      setTotalBalance(total);

      // fetch recent transactions for first account (if any)
      setTransactionsLoading(true);
      if (accountArray.length > 0) {
        const firstId = accountArray[0].id || accountArray[0]._id || accountArray[0].account_id || accountArray[0].id;
        try {
          const txs = await getTransactions(firstId, 0, 10);
          setRecentTransactions(Array.isArray(txs) ? txs : txs.transactions || []);
        } catch (txErr) {
          console.error('Transactions fetch error:', txErr);
          setRecentTransactions([]);
        }
      } else {
        setRecentTransactions([]);
      }

    } catch (err) {
      console.error('Accounts fetch error:', err);
      setAccounts([]);
      setRecentTransactions([]);
      setTotalBalance(0);
    } finally {
      setAccountsLoading(false);
      setTransactionsLoading(false);
    }
  };

  const fetchBills = async () => {
    try {
      setBillsLoading(true);
      const b = await getBills();
      const billsArr = Array.isArray(b) ? b : b.bills || [];
      setBillsList(billsArr);
    } catch (err) {
      console.error('Bills fetch error:', err);
      setBillsList([]);
    } finally {
      setBillsLoading(false);
    }
  };


  const handleLogout = () => {
    logoutUser();
    navigate("/");
  };
  // compute monthly income/expenses from recent transactions
  const incomeAmount = recentTransactions.reduce((s, t) => {
    const amt = Number(t.amount ?? t.value ?? t.credit ?? 0);
    return s + (amt > 0 ? amt : 0);
  }, 0);

  const expensesAmount = recentTransactions.reduce((s, t) => {
    const amt = Number(t.amount ?? t.value ?? t.debit ?? 0);
    return s + (amt < 0 ? Math.abs(amt) : 0);
  }, 0);

  const MenuItem = ({ icon: Icon, label, page }) => (
    <button
      onClick={() => setActivePage(page)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        activePage === page ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 pt-14">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white/60 backdrop-blur-xl shadow-xl border-r border-white/40 transition-all`}>
        <div className="p-6">
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

        <div className="absolute bottom-0 left-0 right-0 p-10 border-t">
          {sidebarOpen && (
            <div className="space-y-2">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 text-sm text-gray-700 hover:text-red-600 disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {activePage === 'Home' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
                  <div className="text-sm opacity-90 mb-2">Total Balance</div>
                  <div className="text-xl font-bold mb-4">{accountsLoading ? 'Loading...' : `₹${totalBalance.toFixed(2)}`}</div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>{accountsLoading ? '' : `${accounts.length} account(s)`}</span>
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                  <div className="text-sm text-gray-500 mb-2">Monthly Income</div>
                  <div className="text-xl font-bold text-gray-900 mb-4">{transactionsLoading ? 'Loading...' : `₹${incomeAmount.toFixed(2)}`}</div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>{transactionsLoading ? '' : `${recentTransactions.length} recent txs`}</span>
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                  <div className="text-sm text-gray-500 mb-2">Monthly Expenses</div>
                  <div className="text-xl font-bold text-gray-900 mb-4">{transactionsLoading ? 'Loading...' : `₹${expensesAmount.toFixed(2)}`}</div>
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <ArrowDownRight className="w-4 h-4" />
                    <span>{billsLoading ? '' : `${billsList.length} bills`}</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Recent Transactions</h2>
                    <button className="text-blue-600 text-sm font-medium">View All</button>
                  </div>
                  <div className="space-y-4">
                    {transactionsLoading ? (
                      <p className="text-sm text-gray-500">Loading transactions...</p>
                    ) : recentTransactions.length === 0 ? (
                      <p className="text-sm text-gray-500">No recent transactions</p>
                    ) : (
                      recentTransactions.slice(0, 4).map((tx, i) => {
                        const amt = Number(tx.amount ?? tx.value ?? tx.credit ?? tx.debit ?? 0);
                        const isIncome = amt > 0;
                        return (
                          <div key={i} className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                isIncome ? 'bg-green-100' : 'bg-red-100'
                              }`}>
                                {isIncome ? (
                                  <ArrowUpRight className="w-5 h-5 text-green-600" />
                                ) : (
                                  <ArrowDownRight className="w-5 h-5 text-red-600" />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{tx.description || tx.name || tx.title || 'Transaction'}</div>
                                <div className="text-sm text-gray-500">{tx.date || tx.created_at || ''}</div>
                              </div>
                            </div>
                            <div className={`font-bold ${isIncome ? 'text-green-600' : 'text-gray-900'}`}>
                              {isIncome ? '+' : '-'}₹{Math.abs(amt).toFixed(2)}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Budget Overview</h2>
                    <button className="text-blue-600 text-sm font-medium">Manage</button>
                  </div>
                  <div className="space-y-4">
                    {budgetsLoading ? (
                        <p className="text-sm text-gray-500">Loading budgets...</p>
                      ) : budgets.length === 0 ? (
                        <p className="text-sm text-gray-500">No budgets found</p>
                      ) : (
                        budgets.map((budget, i) => {
                          const spent = Number(budget.spent_amount);
                          const limit = Number(budget.limit_amount);
                          const percent = Math.min((spent / limit) * 100, 100);

                          return (
                            <div key={i}>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">{budget.category}</span>
                                <span className="text-sm text-gray-500">
                                  ₹{spent} / ₹{limit}
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    percent >= 100
                                      ? 'bg-red-500'
                                      : percent >= 80
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                  }`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      )}

                  </div>
                </div>
              </div>
            </div>
          )}

          {activePage === 'accounts' && <Accounts />}
          {activePage === 'transactions' && <Transactions />}
          {activePage === 'budget' && <Budgets />}
          {activePage === 'bills' && <Bills/>}
          {activePage === 'rewards' && <Rewards/>}
          {activePage === 'settings' && <Setting/>}
        </div>
      </main>
    </div>
  );
}