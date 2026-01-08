import axiosClient from './client';

export const login = async (credentials) => {
  // Clear any existing token before login
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  const loginData = {
    email: credentials.email,
    password: credentials.password
  };
  console.log('Login request data:', loginData);
  const response = await axiosClient.post('/api/auth/login', loginData);
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
  const response = await axiosClient.get('/profile');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await axiosClient.put('/profile', { name: data });
  return response.data;
};

export const getAccounts = async () => {
  const response = await axiosClient.get('/profile/accounts');
  return response.data;
};

export const setActiveAccount = async (account_id) => {
  const response = await axiosClient.post('/profile/accounts/active', { account_id });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axiosClient.post('/auth/forgot-password', { email: email });
  return response.data;
};

export const verifyOTP = async (email, otp) => {
  const response = await axiosClient.post('/auth/verify-otp', { email, otp });
  return response.data;
};

export const resetPassword = async (email, otp, new_password) => {
  const response = await axiosClient.post('/auth/reset-password', { email, otp, new_password });
  return response.data;
};

export const changePassword = async (oldPassword, newPassword, confirmPassword) => {
  const response = await axiosClient.post('/auth/change-password', {
    old_password: oldPassword,
    new_password: newPassword,
    confirm_password: confirmPassword
  });
  return response.data;
};