import axiosClient from "../utils/axiosClient";

export const getAccounts = async () => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE}/accounts/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAccount = async (accountId) => {
  try {
    const response = await axiosClient.get(`/accounts/${accountId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createAccount = async (data) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE}/accounts/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateAccount = async (accountId, data) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE}/accounts/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteAccount = async (accountId) => {
  try {
    const token = localStorage.getItem('access_token');
    await fetch(`${API_BASE}/accounts/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (error) {
    throw error.response?.data || error.message;
  }
};