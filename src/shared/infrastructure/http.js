import axios from 'axios';

export const LOCAL_API_BASE_URL = 'http://localhost:3000';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || LOCAL_API_BASE_URL;

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

export const localHttp = axios.create({
  baseURL: LOCAL_API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('nexa.token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('nexa.token');
      if (window.location.hash !== '#/auth/login') {
        window.location.assign(`${window.location.origin}${window.location.pathname}#/auth/login`);
      }
    }
    return Promise.reject(err);
  }
);

export default http;
