import axiosClient from './client';

export const getBudgets = async () => {
  const response = await axiosClient.get('/budgets/');
  return response.data;
};

export const getCategories = async () => {
  const response = await axiosClient.get('/budgets/categories/');
  return response.data;
};

export const createBudget = async (data) => {
  const response = await axiosClient.post('/budgets/', data);
  return response.data;
};

export const updateBudget = async (id, data) => {
  const response = await axiosClient.put(`/budgets/${id}/`, data);
  return response.data;
};

export const deleteBudget = async (id) => {
  await axiosClient.delete(`/budgets/${id}/`);
  return true;
};