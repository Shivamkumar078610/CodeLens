import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000,
});

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('cl_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  e => {
    e.displayMessage = e.response?.data?.message || e.message || 'Something went wrong';
    return Promise.reject(e);
  }
);

export default api;