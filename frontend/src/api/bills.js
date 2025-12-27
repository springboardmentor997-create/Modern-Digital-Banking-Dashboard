import axiosClient from "../utils/axiosClient";

const BASE_URL = "/bills/";

export const getBills = async () => {
  const { data } = await axiosClient.get(BASE_URL);
  return data;
};


export const addBill = async (payload) => {
  const { data } = await axiosClient.post(BASE_URL, payload);
  return data;
};

export const updateBill = async (id, payload) => {
  const { data } = await axiosClient.put(
    `${BASE_URL}${id}/`,
    payload
  );
  return data;
};


export const deleteBill = async (id) => {
  await axiosClient.delete(`${BASE_URL}${id}/`);
};

export const markPaid = async (id, account_id = null) => {
  const payload = account_id ? { account_id } : {};
  const { data } = await axiosClient.post(`${BASE_URL}${id}/mark-paid`, payload);
  return data;
};
