import axiosClient from '../utils/axiosClient';

export const login = async (email, password) => {
  const response = await axiosClient.post('/auth/login', { email, password });
  return response;
};

export const getProfile = async () => {
  const response = await axiosClient.get('/auth/me');
  return response;
};

export const updateProfile = async (name) => {
  const response = await axiosClient.put('/auth/me', { name });
  return response;
};

export const register = async (name, email, password) => {
  const response = await axiosClient.post('/auth/register', { name, email, password });
  return response;
};

export const forgotPassword = async (email) => {
  const response = await axiosClient.post('/auth/forgot-password', { email });
  return response;
};

export const resetPassword = async (token, newPassword) => {
  const response = await axiosClient.post('/auth/reset-password', { token, new_password: newPassword });
  return response;
};
