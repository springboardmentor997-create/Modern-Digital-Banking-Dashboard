import axiosClient from './client';

export const getAccounts = async () => {
  const response = await axiosClient.get('/api/accounts/');
  return response.data;
};

export const createAccount = async (data) => {
  const response = await axiosClient.post('/api/accounts/', data);
  return response.data;
};

export const deleteAccount = async (accountId) => {
  const response = await axiosClient.delete(`/api/accounts/${accountId}`);
  return response.data;
};