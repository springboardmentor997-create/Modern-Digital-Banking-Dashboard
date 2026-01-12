import axiosClient from "../utils/axiosClient";

const BASE_URL = "/rewards/";

export const fetchRewards = async () => {
  const { data } = await axiosClient.get(BASE_URL);
  return data;
};

export const createReward = async (payload) => {
  const { data } = await axiosClient.post(`${BASE_URL}assign`,payload);
  return data;
};

export const updateReward = async (id, payload) => {
  const { data } = await axiosClient.put(
    `${BASE_URL}${id}/`,
    {
      program_name: payload.program_name,
      points_balance: payload.points_balance,
    }
  );
  return data;
};

export const deleteReward = async (id) => {
  await axiosClient.delete(`${BASE_URL}${id}/`);
};