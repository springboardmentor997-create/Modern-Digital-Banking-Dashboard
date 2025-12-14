import React, { useState, useEffect } from 'react';
import { Home, CreditCard, ReceiptIndianRupee, Gift, TrendingUp, Calendar, Plus, ArrowUpRight, ArrowDownRight, RefreshCcw, User, Settings, LogOut, PieChart, IndianRupee, Mail, Phone, MapPin, Lock, Bell, Globe, ImageOff } from 'lucide-react';
import Accounts from './Accounts.jsx';
import Transactions from './Transactions.jsx';
import Budgets from './Budgets.jsx';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [activePage, setActivePage] = useState('Home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john@email.com',
    phone: '',
    location: ''
  });
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    twoFactor: false,
    darkMode: false,
    currency: 'INR',
    language: 'English'
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadUserProfile();
    loadUserSettings();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadUserSettings = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/user/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      navigate("/");
    } catch (error) {
      console.error('Logout error:', error);
      setMessage({ type: 'error', text: 'Error logging out' });
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      const response = await fetch('http://localhost:8000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userProfile)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Profile updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.detail || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsUpdate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      const response = await fetch('http://localhost:8000/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Settings updated successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.detail || 'Failed to update settings' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.new_password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      const response = await fetch('http://localhost:8000/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: passwordData.current_password,
          new_password: passwordData.new_password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Password changed successfully!' });
        setPasswordData({ current_password: '', new_password: '', confirmPassword: '' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: data.detail || 'Failed to change password' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const transactions = [
    { name: 'Grocery Store', amount: -85.50, date: 'Today', category: 'Food', type: 'expense' },
    { name: 'Salary Deposit', amount: 5000.00, date: 'Today', category: 'Income', type: 'income' },
    { name: 'Electric Bill', amount: -120.00, date: 'Yesterday', category: 'Bills', type: 'expense' },
    { name: 'Coffee Shop', amount: -12.50, date: 'Yesterday', category: 'Food', type: 'expense' },
    { name: 'Amazon Purchase', amount: -245.00, date: '2 days ago', category: 'Shopping', type: 'expense' },
    { name: 'Gas Station', amount: -65.00, date: '2 days ago', category: 'Transport', type: 'expense' }
  ];

  const budgets = [
    { category: 'Food', spent: 450, limit: 600, color: 'blue' },
    { category: 'Shopping', spent: 380, limit: 500, color: 'purple' },
    { category: 'Transport', spent: 180, limit: 200, color: 'yellow' },
    { category: 'Bills', spent: 520, limit: 600, color: 'red' }
  ];

  const bills = [
    { name: 'Netflix Subscription', amount: 15.99, dueDate: 'Dec 15', status: 'upcoming', auto: true },
    { name: 'Internet Bill', amount: 89.99, dueDate: 'Dec 18', status: 'upcoming', auto: false },
    { name: 'Phone Bill', amount: 45.00, dueDate: 'Dec 20', status: 'upcoming', auto: true },
    { name: 'Rent Payment', amount: 1500.00, dueDate: 'Dec 25', status: 'pending', auto: false }
  ];

  const rewards = [
    { name: 'Cashback Earned', amount: 45.50, month: 'November' },
    { name: 'Points Balance', amount: 2450, type: 'points' },
    { name: 'Next Reward', needed: 550, unlock: '50 Voucher' }
  ];

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

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-gray-600" />
            </div>
            {sidebarOpen && (
              <div>
                <div className="font-medium text-sm">{userProfile.name}</div>
                <div className="text-xs text-gray-500">{userProfile.email}</div>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <div className="space-y-2">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="w-full flex items-center gap-2 text-sm text-gray-700 hover:text-red-600 disabled:opacity-50"
              >
                <LogOut className="w-4 h-4" />
                {loading ? 'Logging out...' : 'Logout'}
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
                  <div className="text-3xl font-bold mb-4">₹11,400.50</div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>+12.5% from last month</span>
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                  <div className="text-sm text-gray-500 mb-2">Monthly Income</div>
                  <div className="text-3xl font-bold text-gray-900 mb-4">₹5,000.00</div>
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Salary deposited</span>
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                  <div className="text-sm text-gray-500 mb-2">Monthly Expenses</div>
                  <div className="text-3xl font-bold text-gray-900 mb-4">₹2,245.50</div>
                  <div className="flex items-center gap-2 text-sm text-red-600">
                    <ArrowDownRight className="w-4 h-4" />
                    <span>-15% vs last month</span>
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
                    {transactions.slice(0, 4).map((tx, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            tx.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            {tx.type === 'income' ? 
                              <ArrowUpRight className="w-5 h-5 text-green-600" /> :
                              <ArrowDownRight className="w-5 h-5 text-red-600" />
                            }
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{tx.name}</div>
                            <div className="text-sm text-gray-500">{tx.date}</div>
                          </div>
                        </div>
                        <div className={`font-bold ${tx.type === 'income' ? 'text-green-600' : 'text-gray-900'}`}>
                          {tx.type === 'income' ? '+' : ''}₹{tx.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold">Budget Overview</h2>
                    <button className="text-blue-600 text-sm font-medium">Manage</button>
                  </div>
                  <div className="space-y-4">
                    {budgets.map((budget, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium">{budget.category}</span>
                          <span className="text-sm text-gray-500">₹{budget.spent} / ₹{budget.limit}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full bg-${budget.color}-500`}
                            style={{ width: `${(budget.spent / budget.limit) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePage === 'accounts' && <Accounts />}
          {activePage === 'transactions' && <Transactions />}
          {activePage === 'budget' && <Budgets />}

          {activePage === 'bills' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Upcoming Bills</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Bill
                </button>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {bills.map((bill, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 border-2 hover:shadow-lg transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">{bill.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          Due: {bill.dueDate}
                        </div>
                      </div>
                      {bill.auto && (
                        <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded">
                          Auto-pay
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-4">
                      ₹{bill.amount.toFixed(2)}
                    </div>
                    <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
                      Pay Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePage === 'rewards' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl p-8">
                <h2 className="text-2xl font-bold mb-2">Your Rewards</h2>
                <p className="opacity-90">Keep earning and unlock amazing benefits</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {rewards.map((reward, i) => (
                  <div key={i} className="bg-white rounded-xl p-6 border-2">
                    <Gift className="w-12 h-12 text-purple-600 mb-4" />
                    <h3 className="font-bold text-gray-900 mb-2">{reward.name}</h3>
                    {reward.type === 'points' ? (
                      <div className="text-3xl font-bold text-purple-600">{reward.amount}</div>
                    ) : reward.unlock ? (
                      <div>
                        <div className="text-sm text-gray-500 mb-2">{reward.needed} points needed</div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div className="w-3/4 h-2 bg-purple-500 rounded-full"></div>
                        </div>
                        <div className="text-sm font-medium text-purple-600">₹{reward.unlock}</div>
                      </div>
                    ) : (
                      <div className="text-3xl font-bold text-green-600">₹{reward.amount}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activePage === 'settings' && (
            <div className="space-y-6">
              {message.text && (
                <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'}`}>
                  {message.text}
                </div>
              )}

              <h2 className="text-2xl font-bold">Settings</h2>

              <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Profile Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={userProfile.name || ''}
                      onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={userProfile.email || ''}
                        onChange={(e) => setUserProfile({...userProfile, email: e.target.value})}
                        className="w-full focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        value={userProfile.phone || ''}
                        onChange={(e) => setUserProfile({...userProfile, phone: e.target.value})}
                        className="w-full focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-4 py-2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={userProfile.location || ''}
                        onChange={(e) => setUserProfile({...userProfile, location: e.target.value})}
                        className="w-full focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleProfileUpdate}
                  disabled={loading}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>

              <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Change Password
                </h3>
                <div className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={passwordData.current_password}
                      onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={handlePasswordChange}
                  disabled={loading}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Changing...' : 'Change Password'}
                </button>
              </div>

              <div className="bg-white/70 backdrop-blur-md shadow-lg rounded-2xl p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Preferences
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium">Push Notifications</div>
                        <div className="text-sm text-gray-500">Receive app notifications</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={(e) => setSettings({...settings, notifications: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium">Email Alerts</div>
                        <div className="text-sm text-gray-500">Get transaction alerts via email</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailAlerts}
                        onChange={(e) => setSettings({...settings, emailAlerts: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium">Two-Factor Authentication</div>
                        <div className="text-sm text-gray-500">Extra security for your account</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.twoFactor}
                        onChange={(e) => setSettings({...settings, twoFactor: e.target.checked})}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-3 border-b">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium">Currency</div>
                        <div className="text-sm text-gray-500">Preferred currency display</div>
                      </div>
                    </div>
                    <select
                      value={settings.currency}
                      onChange={(e) => setSettings({...settings, currency: e.target.value})}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-600" />
                      <div>
                        <div className="font-medium">Language</div>
                        <div className="text-sm text-gray-500">App language preference</div>
                      </div>
                    </div>
                    <select
                      value={settings.language}
                      onChange={(e) => setSettings({...settings, language: e.target.value})}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Spanish">Spanish</option>
                      <option value="French">French</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={handleSettingsUpdate}
                  disabled={loading}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}