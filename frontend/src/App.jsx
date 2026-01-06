import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SidebarProvider } from './context/SidebarContext';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import AuditorLayout from './components/AuditorLayout';
import SupportLayout from './components/SupportLayout';

// Page Imports
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions'; 
import Budgets from './pages/Budgets';
import Profile from './pages/Profile';
import Rewards from './pages/Rewards';
import Bills from './pages/Bills';
import Accounts from './pages/Accounts'; 
import Support from './pages/Support';
import Landing from './pages/Landing';
import ForgotPassword from './pages/ForgotPassword';
import Insights from './pages/Insights';
import Alerts from './pages/Alerts';
import AccountProfile from './pages/AccountProfile';
import KYCStatus from './pages/KYCStatus';
import Unauthorized from './pages/Unauthorized';
import SmartExpenseTracker from './pages/SmartExpenseTracker';


// Admin Pages
import SystemSummary from './pages/admin/SystemSummary';
import UserManagement from './pages/admin/UserManagement';
import AccountManagement from './pages/admin/AccountManagement';
import KYCOverview from './pages/admin/KYCOverview';
import AlertsLogs from './pages/admin/AlertsLogs';
import TransactionManagement from './pages/admin/TransactionManagement';
import AdminRewards from './pages/AdminRewards';
import AdminSettings from './pages/admin/AdminSettings';

// Auditor Pages  
import AuditorDashboard from './pages/auditor/AuditorDashboard';
import UsersAudit from './pages/auditor/UsersAudit';
import AccountsAudit from './pages/auditor/AccountsAudit';
import TransactionsAudit from './pages/auditor/TransactionsAudit';
import SystemLogs from './pages/auditor/SystemLogs';
import AuditReports from './pages/auditor/AuditReports';
import AuditorSettings from './pages/auditor/AuditorSettings';

// Support Pages
import SupportDashboard from './pages/support/SupportDashboard'; 

const RoleBasedDashboard = () => {
  const { user } = useAuth();
  
  // Redirect based on role after login
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  } else if (user?.role === 'auditor') {
    return <Navigate to="/auditor" replace />;
  } else if (user?.role === 'support') {
    return <Navigate to="/support" replace />;
  }
  return <Dashboard />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

const AuditorRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'auditor' && user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

const SupportRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'support' && user?.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }
  return children;
};

const ProtectedRoute = ({ children }) => {
  const { user, loading, token } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
      </div>
    );
  }
  
  if (!user || !token) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <SidebarProvider>
      <Router>
          <Routes>
            {/* 1. PUBLIC LANDING PAGE */}
            <Route path="/" element={<Landing />} />
            <Route path="/home" element={<Landing />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* 2. PROTECTED APP ROUTES */}
            <Route path="/app" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Redirects /app to /app/dashboard */}
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              
              {/* All sub-routes start with /app/ */}
              <Route path="dashboard" element={<RoleBasedDashboard />} />
              <Route path="accounts" element={<Accounts />} />
              <Route path="accounts/:id" element={<AccountProfile />} />
              <Route path="transactions" element={<Transactions />} />

              <Route path="budgets" element={<Budgets />} />
              <Route path="bills" element={<Bills />} />
              <Route path="rewards" element={<Rewards />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="insights" element={<Insights />} />
              <Route path="expense-tracker" element={<SmartExpenseTracker />} />
              <Route path="profile" element={<Profile />} />
              <Route path="support" element={<Support />} />
              <Route path="settings" element={<Profile />} />
              <Route path="kyc" element={<KYCStatus />} />
            </Route>

            {/* 3. ADMIN ROUTES */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              </ProtectedRoute>
            }>
              <Route index element={<SystemSummary />} />
              <Route path="overview" element={<SystemSummary />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="accounts" element={<AccountManagement />} />
              <Route path="transactions" element={<TransactionManagement />} />
              <Route path="kyc" element={<KYCOverview />} />
              <Route path="rewards" element={<AdminRewards />} />
              <Route path="alerts" element={<AlertsLogs />} />
              <Route path="notifications" element={<AlertsLogs />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="/auditor" element={
              <ProtectedRoute>
                <AuditorRoute>
                  <AuditorLayout />
                </AuditorRoute>
              </ProtectedRoute>
            }>
              <Route index element={<AuditorDashboard />} />
              <Route path="dashboard" element={<AuditorDashboard />} />
              <Route path="users" element={<UsersAudit />} />
              <Route path="accounts" element={<AccountsAudit />} />
              <Route path="transactions" element={<TransactionsAudit />} />
              <Route path="logs" element={<SystemLogs />} />
              <Route path="reports" element={<AuditReports />} />
              <Route path="settings" element={<AuditorSettings />} />
            </Route>

            {/* 5. SUPPORT ROUTES */}
            <Route path="/support" element={
              <ProtectedRoute>
                <SupportRoute>
                  <SupportLayout />
                </SupportRoute>
              </ProtectedRoute>
            }>
              <Route index element={<SupportDashboard />} />
            </Route>

            {/* 6. UNAUTHORIZED PAGE */}
            <Route path="/unauthorized" element={<Unauthorized />} />

            {/* 7. PUBLIC PAY LINK */}


            {/* 8. FALLBACK - Redirects unknown routes to home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Router>
      </SidebarProvider>
    </AuthProvider>
  );
};

export default App;