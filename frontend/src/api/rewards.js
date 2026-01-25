import axiosClient from '../utils/axiosClient';

export const getRewards = () => axiosClient.get('/rewards');
