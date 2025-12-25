import axiosClient from "../utils/axiosClient";
import formatError from "../utils/formatError";

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
  try {
    await axiosClient.delete(`${BASE_URL}${id}/`);
  } catch (error) {
    throw formatError(error);
  }
};

export const markPaid = async (id, account_id = null) => {
  const payload = { status: "paid" };
  if (account_id) payload.account_id = account_id;
  try {
    const { data } = await axiosClient.put(`${BASE_URL}${id}/`, payload);
    return data;
  } catch (error) {
    throw formatError(error);
  }
};
