import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
const Layout = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (!user) {
    return <Outlet />;
  }
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 text-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">  
         <Outlet />
      </main>
    </div>
  );
};

export default Layout;