import axiosClient from "../utils/axiosClient";

export const getAccounts = async () => {
  try {
    const response = await axiosClient.get("/accounts/");
    return response.data;
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

export const createAccount = async (bankName, accountType, maskedAccount = "", currency = "USD", balance = 0) => {
  try {
    const response = await axiosClient.post("/accounts/", {
      bank_name: bankName,
      account_type: accountType,
      masked_account: maskedAccount,
      currency,
      balance,
    });
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
    const response = await axiosClient.delete(`/accounts/${accountId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
