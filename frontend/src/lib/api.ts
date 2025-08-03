import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for Sanctum cookie-based authentication
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(config => {
  const token = localStorage.getItem('water_billing_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data);
    
    // Handle 401 Unauthorized errors (token expired/invalid)
    if (error.response?.status === 401) {
      console.log('🚨 Unauthorized error detected, clearing auth data');
      localStorage.removeItem('water_billing_token');
      localStorage.removeItem('water_billing_user');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;

