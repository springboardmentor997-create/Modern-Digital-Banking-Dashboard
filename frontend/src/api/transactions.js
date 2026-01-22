import axiosClient from './client';

export const getTransactions = async () => {
  const response = await axiosClient.get('/api/transactions/');
  return response.data;
};

export const createTransaction = async (data) => {
  const response = await axiosClient.post('/api/transactions/', data); 
  return response.data;
};

export const updateTransaction = async (id, data) => {
  const response = await axiosClient.put(`/api/transactions/${id}`, data);
  return response.data;
};

export const deleteTransaction = async (id) => {
  await axiosClient.delete(`/api/transactions/${id}`);
  return true;
};