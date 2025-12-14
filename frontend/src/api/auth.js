import axiosClient from "../utils/axiosClient";

export const register = async (name, email, password, phone = "") => {
  try {
    const response = await axiosClient.post("/auth/register", {
      name,
      email,
      password,
      phone,
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

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};