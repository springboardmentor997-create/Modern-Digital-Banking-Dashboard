/**
 * Authentication context
 *
 * Purpose:
 * Manages global authentication state
 * such as logged-in user and tokens.
 *
 * Used by:
 * - ProtectedRoute.jsx
 * - Login.jsx
 * - Dashboard.jsx
 */




import React, { createContext, useState, useEffect } from 'react';
import api from '@/services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({ user: null, accessToken: null });

  useEffect(() => {
    const tryRefresh = async () => {
      try {
        const res = await api.post('/auth/refresh/cookie'); // uses cookie
        if (res?.data?.access_token) {
          setAuth({ user: res.data.user, accessToken: res.data.access_token });
        }
      } catch (err) {
        // no active session
      }
    };
    tryRefresh();
  }, []);

  return <AuthContext.Provider value={{ auth, setAuth }}>{children}</AuthContext.Provider>;
}
