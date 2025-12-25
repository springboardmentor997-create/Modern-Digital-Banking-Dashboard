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

    // Normalize server error details into a readable string so UI code
    // (e.g. `toast.error(...)`) doesn't receive raw objects/arrays which
    // React cannot render directly and would throw.
    try {
      const serverDetail = error.response?.data?.detail;
      if (serverDetail) {
        if (typeof serverDetail === "string") {
          error.message = serverDetail;
        } else if (Array.isArray(serverDetail)) {
          // Pydantic/FastAPI validation errors often come as arrays of objects
          // with {loc, msg, type}. Join the messages for readability.
          const parts = serverDetail.map((d) => d.msg || JSON.stringify(d));
          error.message = parts.join("; ");
        } else if (typeof serverDetail === "object") {
          // Fallback: stringify objects
          error.message = JSON.stringify(serverDetail);
        }
      } else if (error.response?.data) {
        // If server provided a top-level message, prefer it
        const data = error.response.data;
        if (typeof data === "string") error.message = data;
        else if (data.message) error.message = data.message;
      }
    } catch (e) {
      // Preserve original error.message on any unexpected issue
    }

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
