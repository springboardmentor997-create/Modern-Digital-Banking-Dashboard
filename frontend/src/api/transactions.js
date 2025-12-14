import axiosClient from "../utils/axiosClient";

export const getTransactions = async (accountId, skip = 0, limit = 100) => {
  try {
    const token = localStorage.getItem('access_token');
    const response = await fetch(`${API_BASE}/transactions/${accountId}`, {
      headers: { 'Authorization': `Bearer ${token}` },params: { skip, limit },
    });
    return response.json();
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTransaction = async (accountId, transactionId) => {
  try {
    const response = await axiosClient.get(`/transactions/${accountId}/${transactionId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createTransaction = async (accountId, transactionData) => {
  try {
    const response = await axiosClient.post(`/transactions/${accountId}`, transactionData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const importCSV = async (accountId, file) => {
  try {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${API_BASE}/transactions/${accountId}/import-csv`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    return response.json();
  } catch (error) {
    throw error.response?.data || error.message;
  }
};