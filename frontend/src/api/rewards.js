import axiosClient from "../utils/axiosClient";

export async function fetchRewards() {
  try {
    const response = await axiosClient.get("/rewards/");
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
}

export async function createReward(data) {
  try {
    const response = await axio5544sClient.post("/rewards/", {
      program_name: data.program_name,
      points_balance: data.points_balance,
    });
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
}

export async function updateReward(id, data) {
  try {
    const response = await axiosClient.put(`/rewards/${id}/`, {
      program_name: data.program_name,
      points_balance: data.points_balance,
    });
    return response.data;
  } catch (err) {
    throw err.response?.data || err.message;
  }
}

export async function deleteReward(id) {
  try {
    await axiosClient.delete(`/rewards/${id}/`);
    return true;
  } catch (err) {
    throw err.response?.data || err.message;
  }
}