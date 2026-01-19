import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Shield, Edit2, Check, X, Key, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import { getProfile, updateProfile, getAccounts, setActiveAccount, changePassword } from '../api/auth';
import Loader from '../components/Loader';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { user: authUser } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await getProfile();
        setUser(userData);
        setEditName(userData.name);

        // Fetch accounts too
        try {
          const accountsPayload = await getAccounts();
          setAccounts(accountsPayload.accounts || []);
        } catch (e) {
          console.warn('Failed to load accounts', e);
          setAccounts([]);
        }

      } catch (err) {
        console.error('Profile fetch error:', err);
        // Fallback to auth context user data
        if (authUser) {
          setUser(authUser);
          setEditName(authUser.name);
        } else {
          setError('Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [authUser]);

  const handleUpdate = async () => {
    try {
      const updatedUser = await updateProfile(editName);
      setUser(updatedUser);
      setIsEditing(false);
      // Profile updated successfully
    } catch (err) {
      console.error('Update failed:', err);
      let msg = 'Failed to update profile';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        msg = Array.isArray(detail) ? detail.map(d => `${d.msg}`).join(', ') : String(detail);
      }
      setError(msg);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword(oldPassword, newPassword, confirmPassword);
      setPasswordSuccess('Password changed successfully!');
      
      // Reset form
      setTimeout(() => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordModal(false);
        setPasswordSuccess('');
      }, 2000);
    } catch (err) {
      console.error('Password change failed:', err);
      let msg = 'Failed to change password';
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        msg = Array.isArray(detail) ? detail.map(d => `${d.msg}`).join(', ') : String(detail);
      }
      setPasswordError(msg);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
      <Navbar title="My Profile" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/20">
          {/* Header Background */}
          <div className="h-32 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
          
          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="relative -mt-16 mb-6">
              <div className="w-32 h-32 bg-white rounded-full p-2 inline-block shadow-lg">
                <div className="w-full h-full bg-sky-100 rounded-full flex items-center justify-center text-sky-600 text-4xl font-bold">
                  {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-6">
              <div>
                {isEditing ? (
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="text-3xl font-bold text-gray-900 border-b-2 border-sky-500 focus:outline-none bg-transparent"
                    />
                    <button onClick={handleUpdate} className="p-2 text-green-600 hover:bg-green-50 rounded-full">
                      <Check size={24} />
                    </button>
                    <button onClick={() => { setIsEditing(false); setEditName(user.name); }} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                      <X size={24} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
                    <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-sky-600 transition-colors">
                      <Edit2 size={20} />
                    </button>
                  </div>
                )}
                <p className="text-gray-500">Personal Account</p>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                  {typeof error === 'string' ? error : 'An error occurred'}
                </div>
              )}

              {/* Accounts list */}
              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-2">Accounts</h2>
                <div className="space-y-3">
                  {accounts.length === 0 && (
                    <div className="text-sm text-gray-500">No accounts found.</div>
                  )}
                  {accounts.map((acc) => (
                    <div key={acc.id} className="flex items-center justify-between bg-white p-3 rounded-lg border">
                      <div>
                        <div className="font-semibold">{acc.name} <span className="text-xs text-gray-400">({acc.account_type})</span></div>
                        <div className="text-sm text-gray-500">{acc.bank_name} • {acc.masked_account}</div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Balance</div>
                          <div className="font-semibold">₹{(Number(acc.balance) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                        </div>

                        {acc.is_active ? (
                          <div className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm">Active</div>
                        ) : (
                          <button
                            onClick={async () => {
                              try {
                                await setActiveAccount(acc.id);
                                // reload accounts
                                const payload = await getAccounts();
                                setAccounts(payload.accounts || []);
                                // update profile to reflect active account
                                const updatedProfile = await getProfile();
                                setUser(updatedProfile);
                              } catch (e) {
                                console.error('Set active account failed', e);
                              }
                            }}
                            className="px-3 py-1 bg-sky-600 text-white rounded-full text-sm hover:opacity-90"
                          >
                            Set Active
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm text-sky-600">
                      <User size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Full Name</p>
                      <p className="font-semibold text-gray-900">{user?.name}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm text-sky-600">
                      <Mail size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email Address</p>
                      <p className="font-semibold text-gray-900">{user?.email}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm text-sky-600">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-semibold text-gray-900">
                        {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white rounded-lg shadow-sm text-sky-600">
                      <Shield size={24} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Account Status</p>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <p className="font-semibold text-gray-900">Active</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-lg shadow-sm text-sky-600">
                        <Lock size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Security</p>
                        <p className="font-semibold text-gray-900">Change Password</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowPasswordModal(true)}
                      className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors text-sm"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordError('');
                  setPasswordSuccess('');
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {passwordError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
                {passwordSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordError('');
                    setPasswordSuccess('');
                    setOldPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex-1 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 transition-colors"
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
