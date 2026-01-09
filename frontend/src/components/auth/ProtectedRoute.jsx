/**
 * Component: ProtectedRoute
 *
 * Purpose:
 * - Restricts access to authenticated users only
 * - Prevents unauthenticated users from accessing dashboard pages
 *
 * Key Behavior:
 * - Checks login/auth state (token/session)
 * - Redirects to Login page if user is not authenticated
 *
 * Connected Files:
 * - Wraps all dashboard routes in App.jsx
 *
 * Security Role:
 * - Acts as the first layer of frontend route protection
 */



import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 BLOCK ADMIN FROM USER DASHBOARD
  if (user?.is_admin) {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default ProtectedRoute;




