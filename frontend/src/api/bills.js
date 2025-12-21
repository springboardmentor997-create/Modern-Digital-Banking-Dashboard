import axiosClient from "../utils/axiosClient";

export const getBills = async () => {
  try {
    const res = await axiosClient.get(`/bills/`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const addBill = async (payload) => {
  try {
    await axiosClient.post(`/bills/`, payload);
    return true;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const updateBill = async (id, payload) => {
  try {
    await axiosClient.put(`/bills/${id}`, payload);
    return true;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const deleteBill = async (id) => {
  try {
    await axiosClient.delete(`/bills/${id}`);
    return true;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};

export const markPaid = async (id) => {
  try {
    await axiosClient.put(`/bills/${id}`, { status: 'paid' });
    return true;
  } catch (err) {
    throw err.response?.data || err.message;
  }
};
