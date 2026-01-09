/**
 * Axios API service
 *
 * Purpose:
 * Centralized API configuration
 * for backend communication.
 *
 * Features:
 * - Base URL configuration
 * - Automatic auth token attachment
 * - Used across all pages requiring backend data
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* =====================
   AUTH APIs (ADDED)
   ===================== */

// Forgot password (email or phone)
export const forgotPassword = (data) => {
  return api.post("/auth/forgot-password", data);
};

// Verify OTP (used for forgot password & change pin)
export const verifyOtp = (data) => {
  return api.post("/auth/verify-otp", data);
};

// Reset password
export const resetPassword = (data) => {
  return api.post("/auth/reset-password", data);
};


/* =====================
   ACCOUNT APIs (ADDED)
   ===================== */

// Change account PIN
export const changeAccountPin = (data) => {
  return api.post("/accounts/change-pin", data);
};


// --------------------
// Budgets API
// --------------------

export const getBudgets = (month, year) => {
  return api.get(`/budgets?month=${month}&year=${year}`);
};

export const createBudget = (data) => {
  return api.post("/budgets", data);
};

// ✅ ADDED (required by frontend)
export const updateBudget = (id, data) => {
  return api.patch(`/budgets/${id}`, data);
};

// ✅ ADDED (required by frontend)
export const deleteBudget = (id) => {
  return api.delete(`/budgets/${id}`);
};

// --------------------
// Rewards APIs
// --------------------
export const getRewards = () => {
  return api.get("/rewards");
};

// --------------------
// Bills API
// --------------------

export const payBill = (data) => {
  return api.post("/bills/pay", data);
};


// --------------------
// Insights APIs
// --------------------

export const getInsightsSummary = () => {
  return api.get("/insights/summary");
};

export const getMonthlySpending = (month, year) => {
  return api.get(`/insights/monthly?month=${month}&year=${year}`);
};

export const getCategoryBreakdown = (month, year) => {
  return api.get(`/insights/categories?month=${month}&year=${year}`);
};

export const getRecentTransactions = () =>
  api.get("/transactions?limit=3");

export default api;
