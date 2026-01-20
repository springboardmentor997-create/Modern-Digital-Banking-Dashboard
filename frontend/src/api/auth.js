import axiosClient from './client';

export const login = async (credentials) => {
  const response = await axiosClient.post('/api/auth/login', credentials);
  return response.data;
};

export const signup = async (data) => {
  console.log('Signup request data:', data);
  const response = await axiosClient.post('/api/auth/signup', data);
  console.log('Signup response:', response.data);
  return response.data;
};

export const register = signup;

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getProfile = async () => {
  const response = await axiosClient.get('/api/profile');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await axiosClient.put('/api/profile', { name: data });
  return response.data;
};

export const getAccounts = async () => {
  const response = await axiosClient.get('/api/profile/accounts');
  return response.data;
};

export const setActiveAccount = async (account_id) => {
  const response = await axiosClient.post('/api/profile/accounts/active', { account_id });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axiosClient.post('/api/auth/forgot-password', { email: email });
  return response.data;
};

export const verifyOTP = async (email, otp) => {
  const response = await axiosClient.post('/api/auth/verify-otp', { email, otp });
  return response.data;
};

export const resetPassword = async (email, otp, new_password) => {
  const response = await axiosClient.post('/api/auth/reset-password', { email, otp, new_password });
  return response.data;
};

export const changePassword = async (oldPassword, newPassword, confirmPassword) => {
  const response = await axiosClient.post('/api/auth/change-password', {
    old_password: oldPassword,
    new_password: newPassword,
    confirm_password: confirmPassword
  });
  return response.data;
};