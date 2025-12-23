import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User,Mail,Phone,Key,Lock,Globe,Settings,Bell,Banknote} from 'lucide-react';
import axiosClient from "../utils/axiosClient";

export default function Setting(){
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john@email.com',
    phone: '',
    kyc_status: ""
  });
  
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data } = await axiosClient.get("/auth/me/");
      setUserProfile({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        kyc_status: data.kyc_status 
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };
  
  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
  
      const { data } = await axiosClient.put(
        "/user/profile/",
        userProfile
      );
  
      toast.success(data.message || "Profile updated successfully!");
    } catch (error) {
      toast.error( error.response?.data?.detail || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };
  
  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirmPassword) {
      toast.error( "New passwords do not match" );
      return;
    }
  
    if (passwordData.new_password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
  
    try {
      setLoading(true);
  
      const { data } = await axiosClient.post(
        "/user/change-password/",
        {
          current_password: passwordData.current_password,
          new_password: passwordData.new_password,
        }
      );
      
      toast.success(data.message || "Password changed successfully!")
  
      setPasswordData({
        current_password: "",
        new_password: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };
  

  return (
      <div className="space-y-6">

        <h2 className="text-4xl font-bold">Settings</h2>

        <div className="bg-white/70 backdrop-blur-md shadow-xl rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Profile Information
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={userProfile.name || ""}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, name: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-2">
                <Mail className="w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={userProfile.email || ""}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, email: e.target.value })
                  }
                  className="w-full focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <div className="flex items-center gap-3 border border-gray-300 rounded-xl px-4 py-2">
                <Phone className="w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  value={userProfile.phone || ""}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, phone: e.target.value })
                  }
                  className="w-full focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-6">
              <Key className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">KYC Status</p>
                <p
                  className={`text-sm font-semibold ${
                    userProfile.kyc_status=== "verified" ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {userProfile.kyc_status === "verified" ? "verified" : "Unverified"}
                </p>
              </div>
              <input
                type="checkbox"
                checked={userProfile.kyc_status === "verified"}
                disabled={userProfile.kyc_status === "verified"}
                onChange={() => startKycVerification()}
                className={`ml-auto h-5 w-5 accent-green-600 ${
                  userProfile.kyc_status === "verified"
                    ? "cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              />
            </div>
          </div>

          <button
            onClick={handleProfileUpdate}
            disabled={loading}
            className="mt-8 w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all"
          >
            {loading ? "Saving..." : "Save Profile"}
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
      </div>
  )
}