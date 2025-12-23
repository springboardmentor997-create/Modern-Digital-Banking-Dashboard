import axios from "axios";

const API_BASE_URL = "https://modern-digital-banking-dashboard.onrender.com/api";

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
      !originalRequest._retry
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

        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
