import axios from 'axios';

// Ensure the API URL always ends with /api, even if the user forgets it in the .env
let API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
if (API_URL && !API_URL.endsWith('/api')) {
  API_URL = API_URL.replace(/\/$/, "") + '/api';
}

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;