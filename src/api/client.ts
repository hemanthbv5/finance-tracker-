import axios from 'axios';

// Dynamically use the current hostname so mobile devices on the network can connect
const hostname = window.location.hostname;
// If the app is served on 5173 (Vite dev), point to 3001. If served on 3001 (production), point to itself.
const API_BASE = window.location.port === '5173' 
  ? `http://${hostname}:3001/api` 
  : `http://${hostname}:${window.location.port}/api`;

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
