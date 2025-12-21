import { useState, useEffect } from 'react';
import { User, Mail, Calendar, Shield, Edit2, Check, X } from 'lucide-react';
// 1. REMOVED Navbar import
import { getProfile, updateProfile } from '../api/auth';
import Loader from '../components/Loader';
import useAuth from '../hooks/useAuth';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const { fetchUser } = useAuth();

  // Helper to capitalize first letter (Used everywhere)
  const formatName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userData = await getProfile();
        setUser(userData);
        // Force capitalization immediately on load
        setEditName(formatName(userData.name));
      } catch (err) {
        setError('Failed to load profile');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    try {
      // 1. Force formatting before sending to API (Permanent Fix)
      const finalName = formatName(editName);
      
      const updatedUser = await updateProfile(finalName);
      setUser(updatedUser);
      setIsEditing(false);
      fetchUser(); // Update global context
    } catch (err) {
      console.error('Update failed:', err);
      setError(err.response?.data?.detail || 'Failed to update profile');
    }
  };

  // 2. Handler to auto-capitalize while typing
  const handleInputChange = (e) => {
    const val = e.target.value;
    // Capitalize first letter immediately as user types
    const capitalizedVal = val.charAt(0).toUpperCase() + val.slice(1);
    setEditName(capitalizedVal);
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        {/* Header Background */}
        <div className="h-32 bg-gradient-to-r from-sky-500 to-blue-600"></div>
        
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
                    onChange={handleInputChange} // Uses the new handler
                    className="text-3xl font-bold text-gray-900 border-b-2 border-sky-500 focus:outline-none bg-transparent px-1"
                  />
                  <button onClick={handleUpdate} className="p-2 text-green-600 hover:bg-green-50 rounded-full">
                    <Check size={24} />
                  </button>
                  <button onClick={() => { setIsEditing(false); setEditName(formatName(user.name)); }} className="p-2 text-red-600 hover:bg-red-50 rounded-full">
                    <X size={24} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {formatName(user?.name)}
                  </h1>
                  <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-sky-600 transition-colors">
                    <Edit2 size={20} />
                  </button>
                </div>
              )}
              <p className="text-gray-500">Personal Account</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm text-sky-600">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-semibold text-gray-900">
                      {formatName(user?.name)}
                    </p>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;