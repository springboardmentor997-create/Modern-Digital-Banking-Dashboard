import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { User,Mail,Phone,Key,Lock,Globe,Settings,Bell,Banknote} from 'lucide-react';
import {getMe,updateProfile,changePassword,verifyKYC,deleteProfile} from "../api/users";
import Load from '../components/Loader';

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

  function confirmDelete(onConfirm) {
    toast.custom((t) => (
      <div className="bg-white rounded-xl shadow-lg p-4 w-80">
        <p className="text-gray-800 font-medium mb-4">
          Are you sure you want to delete this account?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={() => {
              toast.dismiss(t.id);
              onConfirm();
            }}
            className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    ));
  }

  const handleDeleteAccount = () => {
    confirmDelete(async () => {
      try {
        setLoading(true);
        await deleteProfile();

        toast.success("Account deleted successfully");

        localStorage.clear();
        window.location.href = "/";
      } catch (error) {
        toast.error(error?.response?.data?.detail || "Account deletion failed");
      } finally {
        setLoading(false);
      }
    });
  };

 const loadUserProfile = async () => {
    try {
      setLoading(true);
      const data = await getMe();
      setUserProfile({
        name: data.name,
        email: data.email,
        phone: data.phone,
        kyc_status: data.kyc_status
      });
    } catch (error) {
      toast.error("Failed to load user, Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyKYC = async () => {
    try {
      setLoading(true);
      const data = await verifyKYC();
      setUserProfile((prev) => ({
        ...prev,
        kyc_status: data.kyc_status,
      }));
      toast.success("KYC verified successfully");
    } catch (error) {
      toast.error("KYC verification failed");
    } finally {
      setLoading(false);
    }
  };

  
  const handleProfileUpdate = async () => {
    try {
      setLoading(true);
      await updateProfile(userProfile);
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.new_password !== passwordData.confirmPassword) {
      return toast.error("Passwords do not match");
    }

    try {
      setLoading(true);
      await changePassword({
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
      });

      toast.success("Password changed successfully");

      setPasswordData({
        current_password: "",
        new_password: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(error?.response?.data?.detail || "Password change failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Load/>
  }

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
                    userProfile.kyc_status === "verified"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {userProfile.kyc_status === "verified" ? "Verified" : "Unverified"}
                </p>
              </div>

              {userProfile.kyc_status !== "verified" && (
                <button
                  onClick={handleVerifyKYC}
                  disabled={loading}
                  className="ml-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Verifying..." : "Verify KYC"}
                </button>
              )}
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
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold mb-4 text-red-600 flex items-center gap-2">
            <Banknote className="w-5 h-5" />
            Danger Zone
          </h3>

          <p className="text-sm text-red-500 mb-4">
            Deleting your account is permanent and cannot be undone.
          </p>

          <button
            onClick={handleDeleteAccount}
            disabled={loading}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Deleting..." : "Delete Account"}
          </button>
        </div>
      </div>
  )
}