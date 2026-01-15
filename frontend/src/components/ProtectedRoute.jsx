import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import React from "react";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  if (!user) return <Navigate to="/" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
