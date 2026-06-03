import axios from 'axios';

const api = axios.create({ baseURL: '', timeout: 60000 });

api.interceptors.request.use(cfg => {
  const t = localStorage.getItem('cl_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

api.interceptors.response.use(
  r => r,
  e => { e.displayMessage = e.response?.data?.message || e.message || 'Something went wrong'; return Promise.reject(e); }
);

export default api;
