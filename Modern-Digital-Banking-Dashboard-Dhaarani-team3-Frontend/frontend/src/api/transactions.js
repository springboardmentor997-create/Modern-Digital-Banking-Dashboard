import axiosClient from "../utils/axiosClient";

export const getTransactions = async (accountId, skip = 0, limit = 100) => {
  try {
    const response = await axiosClient.get(
      `/transactions/${accountId}`,
      { params: { skip, limit } }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getTransaction = async (accountId, transactionId) => {
  try {
    const response = await axiosClient.get(
      `/transactions/${accountId}/${transactionId}`
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createTransaction = async (accountId, transactionData) => {
  try {
    const response = await axiosClient.post(
      `/transactions/${accountId}`,
      transactionData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const importCSV = async (accountId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosClient.post(
      `/transactions/${accountId}/import-csv`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
