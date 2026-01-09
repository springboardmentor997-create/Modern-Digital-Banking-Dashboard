/**
 * Application route configuration
 *
 * Purpose:
 * - Defines public, user, and admin routes
 * - Uses layout-based routing
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { initNotifications } from "./notification";

/* =======================
   USER PUBLIC PAGES
======================= */
import Home from "./pages/user/Home";
import Login from "./pages/user/Login";
import Register from "./pages/user/Register";
import ForgotPassword from "./pages/user/ForgotPassword";
import ResetPassword from "./pages/user/ResetPassword";

/* =======================
   USER DASHBOARD LAYOUT
======================= */
import Dashboard from "./pages/user/Dashboard";
import DashboardHome from "./pages/user/DashboardHome";

/* USER DASHBOARD PAGES */
import Profile from "./pages/user/Profile";
import Accounts from "./pages/user/Accounts";
import CheckBalance from "./pages/user/CheckBalance";
import Transactions from "./pages/user/Transactions";
import Budgets from "./pages/user/Budgets";
import BudgetSummary from "./pages/user/BudgetSummary";
import Bills from "./pages/user/Bills";
import Rewards from "./pages/user/Rewards";
import TotalEarned from "./pages/user/TotalEarned";
import Insights from "./pages/user/Insights";
import Notifications from "./pages/user/Notifications";
import Alerts from "./pages/user/Alerts";
import Settings from "./pages/user/Settings";

/* TRANSFERS */
import SendMoney from "./pages/user/SendMoney";
import SendToUpi from "./pages/user/SendToUpi";
import SendToSelf from "./pages/user/SendToSelf";
import SendToBank from "./pages/user/SendToBank";

/* PAYMENT RESULT */
import PaymentSuccess from "./pages/user/PaymentSuccess";
import PaymentFailed from "./pages/user/PaymentFailed";

import BillProcessing from "./pages/user/BillProcessing";
import VerifyIdentity from "./pages/user/VerifyIdentity";
import VerifyOtp from "./pages/user/VerifyOtp";
import ChangePin from "./pages/user/ChangePin";


/* =======================
   ADMIN LAYOUT & PAGES
======================= */
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminKYCApproval from "./pages/admin/AdminKYCApproval";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminRewards from "./pages/admin/AdminRewards";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminAlerts from "./pages/admin/AdminAlerts";
import AdminSettings from "./pages/admin/AdminSettings";

/* =======================
   ROUTE GUARDS
======================= */
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";

function App() {
  useEffect(() => {
    initNotifications();
  }, []);

  return (
    <Routes>
      {/* =======================
          PUBLIC ROUTES
      ======================= */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />

      {/* =======================
          USER DASHBOARD
      ======================= */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
              <Dashboard />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />

        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />

        <Route path="accounts" element={<Accounts />} />
        <Route path="accounts/verify-identity" element={<VerifyIdentity />} />
        <Route path="accounts/verify-otp" element={<VerifyOtp />} />
        <Route path="accounts/change-pin" element={<ChangePin />} />
        <Route path="balance" element={<CheckBalance />} />

        <Route path="transfers" element={<SendMoney />} />
        <Route path="transfers/upi" element={<SendToUpi />} />
        <Route path="transfers/self" element={<SendToSelf />} />
        <Route path="transfers/bank" element={<SendToBank />} />

        <Route path="payment-success" element={<PaymentSuccess />} />
        <Route path="payment-failed" element={<PaymentFailed />} />

        <Route path="budgets" element={<Budgets />} />
        <Route path="budgets/summary" element={<BudgetSummary />} />

        <Route path="transactions" element={<Transactions />} />
        <Route path="bills" element={<Bills />} />
        <Route path="bill-processing" element={<BillProcessing />} />

        <Route path="rewards" element={<Rewards />} />
        <Route path="rewards/total-earned" element={<TotalEarned />} />

        <Route path="insights" element={<Insights />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="settings" element={<Settings />} />

      </Route>

      {/* =======================
          ADMIN PANEL
      ======================= */}
      <Route
        path="/admin/*"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="kyc" element={<AdminKYCApproval />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="rewards" element={<AdminRewards />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="alerts" element={<AdminAlerts />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* =======================
          FALLBACK
      ======================= */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
