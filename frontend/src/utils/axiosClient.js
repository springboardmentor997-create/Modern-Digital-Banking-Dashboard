import axios from "axios";

// Use Vite environment variable `VITE_API_URL` exclusively. Do NOT fall back to localhost
// to avoid accidental production requests going to local servers.
const API_BASE_URL = import.meta.env.VITE_API_URL;

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const refreshAccessToken = async () => {
  const refresh = localStorage.getItem("refresh_token");

  if (!refresh) throw new Error("No refresh token");

  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    { refresh }
  );

  const newAccess = response.data.access_token;
  console.log(response.data,response)
  localStorage.setItem("access_token", newAccess);
  localStorage.setItem("refresh_token",response.data.refresh_token)
  return newAccess;
};

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry && !originalRequest.url.includes("/auth/login")
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);

      } catch (refreshError) {
        console.warn("Refresh token failed, logging out");

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
