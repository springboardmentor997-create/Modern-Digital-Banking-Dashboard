import axiosClient from '../utils/axiosClient';

export const getBudgets = () => axiosClient.get('/budgets');
export const createBudget = (data) => axiosClient.post('/budgets', data);
export const deleteBudget = (id) => axiosClient.delete(`/budgets/${id}`);
