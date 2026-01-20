import axios from 'axios';

// Use environment variable for API URL or backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://modern-digital-banking-dashboard-1-vg97.onrender.com';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // Increased timeout for slow backend responses
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    // List of auth endpoints that DON'T need authentication
    const publicAuthEndpoints = ['/api/auth/login', '/api/auth/signup', '/api/auth/forgot-password', '/api/auth/verify-otp', '/api/auth/reset-password'];
    
    // Add token for all requests except public auth endpoints
    const isPublicAuthEndpoint = publicAuthEndpoints.some(endpoint => config.url.includes(endpoint));
    
    if (!isPublicAuthEndpoint && token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    console.log(`🚀 Request: ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

axiosClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    const message = error.response?.data?.detail || error.message;

    if (status === 401) {
      console.error("🔐 Unauthorized (401) Error Details:");
      console.error("- URL:", error.config?.url);
      console.error("- Method:", error.config?.method);
      console.error("- Token in localStorage:", localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
      console.error("- Message:", message);
      
      // Only redirect if we're not already on login or public pages
      const publicPaths = ['/login', '/register', '/forgot-password', '/', '/home'];
      const currentPath = window.location.pathname;
      
      if (!publicPaths.includes(currentPath) && !currentPath.includes('/login')) {
        console.warn("🔐 Clearing invalid token and redirecting to login...");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.replace('/login');
      }
    } else if (status === 422) {
      console.error(`❌ Validation Error (${status}):`, error.response?.data);
    } else if (status === 500) {
      console.error("🔥 Backend Error (500):", message);
    } else if (!error.response) {
      console.error("🌐 Network Error: Cannot connect to backend server");
    } else {
      console.error(`❌ API Error (${status}):`, message);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;
