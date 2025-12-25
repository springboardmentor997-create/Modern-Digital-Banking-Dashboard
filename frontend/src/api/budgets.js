import axiosClient from "../utils/axiosClient";
import formatError from "../utils/formatError";

const BASE_URL = "/budgets";

export const getBudgets = async (month, year) => {
  try {
    const { data } = await axiosClient.get(`${BASE_URL}/`);
    return data;
  } catch (error) {
    throw formatError(error);
  }
};

export const createBudget = async (payload) => {
  try {
    const { data } = await axiosClient.post(BASE_URL, payload);
    return data;
  } catch (error) {
    throw formatError(error);
  }
};

export const updateBudget = async (id, payload) => {
  try {
    const { data } = await axiosClient.put(`${BASE_URL}/${id}`, payload);
    return data;
  } catch (error) {
    throw formatError(error);
  }
};

export const deleteBudget = async (id) => {
  try {
    await axiosClient.delete(`${BASE_URL}/${id}`);
  } catch (error) {
    throw formatError(error);
  }
};
