import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // If using cookies
});

// Request interceptor
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      const decoded = jwtDecode(token);
      
      // Check token expiration with 5-minute buffer
      if (decoded.exp * 1000 < Date.now() - 300000) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login?session=expired';
        return Promise.reject(new Error('Token expired'));
      }
      
      config.headers.Authorization = `Bearer ${token}`;
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?error=invalid_token';
      return Promise.reject(error);
    }
  }
  
  return config;
}, error => {
  return Promise.reject(error);
});

// Response interceptor
api.interceptors.response.use(
  response => response,
  error => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login?error=session_expired';
    }
    
    // Handle 400 Bad Request specifically
    if (error.response?.status === 400) {
      console.error('Bad Request Details:', error.response.data);
      return Promise.reject(error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;