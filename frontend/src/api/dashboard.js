import axiosClient from './client';

export const getDashboardStats = async () => {
  const response = await axiosClient.get('/api/dashboard-stats');
  return response.data;
};

export const getSpendingByCategory = async (month, year) => {
  const params = new URLSearchParams();
  if (month) params.append('month', month);
  if (year) params.append('year', year);
  
  const response = await axiosClient.get(`/api/dashboard/spending-by-category?${params}`);
  return response.data;
};