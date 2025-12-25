import axiosClient from "../utils/axiosClient";
import formatError from "../utils/formatError";

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
    throw formatError(error);
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
    throw formatError(error);
  }
};

export const logout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};

export const getMe = async () => {
  const res = await axiosClient.get("/auth/me");
  return res.data;
};