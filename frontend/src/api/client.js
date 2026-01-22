import axios from 'axios';

// Use environment variable for API URL, fallback to localhost
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Log the API URL to console to verify connection (for debugging)
console.log(`🔌 Connecting to API at: ${API_BASE_URL}`);

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 60 second timeout to handle slow Render free tier cold starts
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
    
    console.log(`🚀 Request: ${config.method.toUpperCase()} ${config.url}`);
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
      console.error("- Headers:", error.config?.headers);
      console.error("- Token in localStorage:", localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
      console.error("- Message:", message);
      
      // Only redirect if we're not already on login or public pages
      const publicPaths = ['/login', '/register', '/forgot-password', '/', '/home'];
      const currentPath = window.location.pathname;
      
      if (!publicPaths.includes(currentPath) && !currentPath.includes('/login')) {
        console.warn("🔐 Clearing invalid token and redirecting to login...");
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Use React Router navigation instead of hard redirect to preserve state
        // This prevents clearing React state unnecessarily
        window.location.replace('/login');
      }
    } else if (status === 422) {
      console.error(`❌ Validation Error (${status}):`, error.response?.data);
      console.error('Request URL:', error.config?.url);
      console.error('Request Data:', error.config?.data);
    } else if (status === 500) {
      console.error("🔥 Backend Error (500):", message);
    } else if (!error.response) {
      console.error("🌐 Network Error: Backend server may be down");
      console.error("💡 Please check if the backend server is running on http://localhost:8000");
      console.error("💡 Try running: cd backend && python start_server.py");
    } else {
      console.error(`❌ API Error (${status}):`, message);
    }

    return Promise.reject(error);
  }
);

export default axiosClient;