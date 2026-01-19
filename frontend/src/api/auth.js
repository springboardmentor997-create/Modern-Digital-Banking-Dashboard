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
  
  try {
    const response = await axiosClient.post('/api/auth/login', loginData);
    console.log('Login response data:', response.data);
    console.log('Has access_token?', !!response.data?.access_token);
    console.log('Has user?', !!response.data?.user);
    
    if (!response.data?.access_token) {
      console.error('Backend returned no access_token:', response.data);
      throw new Error('Backend did not return access token');
    }
    
    return response.data;
  } catch (error) {
    console.error('Login API error:', error);
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('Connection timeout - backend may be down');
    }
    if (error.code === 'ERR_NETWORK' || !error.response) {
      throw new Error('Cannot connect to backend server');
    }
    if (error.response?.status === 404) {
      throw new Error('Login endpoint not found - check backend URL');
    }
    throw error;
  }
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