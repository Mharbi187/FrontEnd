import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

api.interceptors.response.use(
  response => response,
  error => {
    console.error('Axios Error Details:', {
      message: error.message,
      config: error.config,
      response: error.response?.data
    });
    return Promise.reject(error);
  }
);

export default api;