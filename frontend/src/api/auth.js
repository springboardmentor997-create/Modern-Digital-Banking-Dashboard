import axiosClient from "../utils/axiosClient";

export const register = async (name, email, password, phone = "",role) => {
  try {
    const response = await axiosClient.post("/auth/register", {
      name,
      email,
      password,
      phone,
      role
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const login = async (email, password) => {
  try {
    const response = await axiosClient.post("/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getMe = async () => {
  const res = await axiosClient.get("/auth/me");
  return res.data;
};