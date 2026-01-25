import axiosClient from '../utils/axiosClient';

export const getTransactions = (params) => axiosClient.get('/transactions', { params });
export const getRecentTransactions = () => axiosClient.get('/transactions/recent');
export const createTransaction = (data) => axiosClient.post('/transactions', data);
