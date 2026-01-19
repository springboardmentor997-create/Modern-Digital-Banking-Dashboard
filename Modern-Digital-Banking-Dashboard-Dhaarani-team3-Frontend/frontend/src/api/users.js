import axiosClient from "../utils/axiosClient";

export const getUsers = async () => {
    try{
        const {data} = await axiosClient.get('/user/');
        return data;
    } catch (error) {
    throw error.response?.data?.detail || error.message;
  }
};

export const getMe = async () => {
  const res = await axiosClient.get("/auth/me");
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await axiosClient.put("/user/profile", data);
  return res.data;
};

export const getUserById = async (userId) => {
  const res = await axiosClient.get(`/user/${userId}`);
  return res.data;
};

export const getSettings = async () => {
  const res = await axiosClient.get("/user/settings");
  return res.data;
};

export const updateSettings = async (data) => {
  const res = await axiosClient.put("/user/settings", data);
  return res.data;
};

export const changePassword = async (payload) => {
  const res = await axiosClient.post("/user/change-password", payload);
  return res.data;
};

export const verifyKYC = async () => {
  const res = await axiosClient.post("/user/profile/verify-kyc");
  return res.data;
};

export const deleteProfile = async () => {
  const res = await axiosClient.delete("/user/profile");
  return res.data;
};