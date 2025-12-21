import axiosClient from '../utils/axiosClient';

export const getAccounts = () => axiosClient.get('/accounts');
export const getAccountDetails = (id) => axiosClient.get(`/accounts/${id}`);
export const createAccount = (accountData) => axiosClient.post('/accounts', accountData);
export const deleteAccount = (id) => axiosClient.delete(`/accounts/${id}`);
