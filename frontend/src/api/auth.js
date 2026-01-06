import axiosClient, { API_BASE_URL } from "../utils/axiosClient";
import axios from "axios";

export const register = async (name, email, password, phone = "",role) => {
  const payload = { name, email, password, phone, role };
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, payload, { withCredentials: true });
    console.log("REGISTER SUCCESS", response && response.data);
    return response.data;
  } catch (err) {
    console.log("REGISTER ERROR RAW", err);
    if (err.response) {
      console.log("STATUS", err.response.status);
      console.log("DATA", err.response.data);
    } else {
      console.log("MESSAGE", err.message);
    }
    throw err.response?.data || err.message;
  }
};

export const login = async (email, password) => {
  const payload = { email, password };
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/login`, payload, { withCredentials: true });
    console.log("LOGIN SUCCESS", res && res.data);
    return res.data;
  } catch (err) {
    console.log("LOGIN ERROR RAW", err);
    if (err.response) {
      console.log("STATUS", err.response.status);
      console.log("DATA", err.response.data);
    } else {
      console.log("MESSAGE", err.message);
    }
    throw err.response?.data || err.message;
  }
};

export const getMe = async () => {
  const res = await axiosClient.get("/auth/me");
  return res.data;
};