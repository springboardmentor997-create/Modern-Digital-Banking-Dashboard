import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/CustDashboard.jsx';
import Services from './pages/Services';
import Analytics from './pages/Analytics';
import Support from './pages/Support';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AuditorDashboard from './pages/AudiDashboard.jsx';

function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <Outlet />
      </main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path = "/Dashboard" element = {
            <ProtectedRoute allowedRoles={["user"]}>
                <Dashboard />
            </ProtectedRoute>
          } />
        <Route path="/Services" element={<Services />} />
        <Route path="/Analytics" element={<Analytics />} />
        <Route path="/Support" element={<Support />} />
        <Route path ="/AdminDashboard" element={
            <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
            </ProtectedRoute>
          }/>
          <Route path ="/AuditorDashboard" element={
            <ProtectedRoute allowedRoles={["Auditor"]}>
                <AuditorDashboard />
            </ProtectedRoute>
          }/>
      </Route>

      <Route path="/login" element={<Login />} />

    </Routes>
  );
}
