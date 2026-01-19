import axiosClient from "../utils/axiosClient";

export const getAccounts = async () => {
  try {
    const response = await axiosClient.get("/accounts/");
    return Array.isArray(response.data)
      ? response.data
      : response.data.accounts;
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
    const response = await axiosClient.post("/accounts/", data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateAccount = async (accountId, data) => {
  try {
    const response = await axiosClient.put(`/accounts/${accountId}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteAccount = async (accountId) => {
  try {
    await axiosClient.delete(`/accounts/${accountId}`);
    return true;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
