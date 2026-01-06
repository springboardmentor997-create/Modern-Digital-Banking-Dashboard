import axiosClient from './client';

export const getTransactions = async () => {
  const response = await axiosClient.get('/transactions/');
  return response.data;
};

export const createTransaction = async (data) => {
  const response = await axiosClient.post('/transactions/', data); 
  return response.data;
};

export const updateTransaction = async (id, data) => {
  const response = await axiosClient.put(`/transactions/${id}/`, data);
  return response.data;
};

export const deleteTransaction = async (id) => {
  await axiosClient.delete(`/transactions/${id}/`);
  return true;
};