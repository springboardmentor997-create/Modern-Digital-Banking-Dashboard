import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User,Mail,Phone,MapPin,Lock,Globe,Settings,Bell,Banknote} from 'lucide-react';
import axiosClient from "../utils/axiosClient";

export default function Setting(){
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john@email.com',
    phone: '',
    location: ''
  });
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
      const res = await axiosClient.get("/auth/me");
      setUserProfile(res.data || {});
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadUserSettings = async () => {
    try {
      const res = await axiosClient.get('/user/settings');
      setSettings(res.data || {});
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  
  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const res = await axiosClient.put('/user/profile', userProfile);
      const data = res.data || {};
      setMessage({ type: 'success', text: data.message || 'Profile updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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
      const res = await axiosClient.put('/user/settings', settings);
      const data = res.data || {};
      setMessage({ type: 'success', text: data.message || 'Settings updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
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
      const res = await axiosClient.post('/user/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });
      const data = res.data || {};
      setMessage({ type: 'success', text: data.message || 'Password changed successfully!' });
      setPasswordData({ current_password: '', new_password: '', confirmPassword: '' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
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
                <Banknote className="w-5 h-5 text-gray-600" />
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
  )
}