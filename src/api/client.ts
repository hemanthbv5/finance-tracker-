import axios from 'axios';

// Use relative path so Vite's proxy can forward requests to the backend securely
const API_BASE = '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('fintrack_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 — auto logout on token expiry
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fintrack_token');
      localStorage.removeItem('fintrack_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default client;
