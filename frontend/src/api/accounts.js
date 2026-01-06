import axiosClient from './client';

export const getAccounts = async () => {
  const response = await axiosClient.get('/accounts/');
  return response.data;
};

export const createAccount = async (data) => {
  const response = await axiosClient.post('/accounts/', data);
  return response.data;
};

export const deleteAccount = async (accountId) => {
  const response = await axiosClient.delete(`/accounts/${accountId}`);
  return response.data;
};