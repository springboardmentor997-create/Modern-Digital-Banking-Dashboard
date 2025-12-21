import axiosClient from '../utils/axiosClient';

export const getAlerts = () => axiosClient.get('/alerts');
export const markAlertAsRead = (id) => axiosClient.put(`/alerts/${id}/read`);
