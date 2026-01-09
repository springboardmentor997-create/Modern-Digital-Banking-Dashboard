import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("access_token");
  const rawUser = localStorage.getItem("user");

  if (!token || !rawUser) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(rawUser);

  // ✅ allow admins ONLY
  if (user.is_admin === true) {
    return children;
  }

  // ❌ block non-admins
  return <Navigate to="/dashboard" replace />;
};

export default AdminRoute;
