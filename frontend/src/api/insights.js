import axiosClient from './client';

export const getInsights = async () => {
  const response = await axiosClient.get('/insights/');
  return response.data;
};

export const getSpendingAnalysis = async (period = 'month') => {
  const response = await axiosClient.get(`/insights/spending?period=${period}`);
  return response.data;
};

export const getCategoryBreakdown = async () => {
  const response = await axiosClient.get('/insights/categories');
  return response.data;
};

export const getMonthlyTrends = async () => {
  const response = await axiosClient.get('/insights/trends');
  return response.data;
};

export const getBudgetInsights = async () => {
  const response = await axiosClient.get('/insights/budgets');
  return response.data;
};