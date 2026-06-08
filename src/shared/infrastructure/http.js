import axios from 'axios';

export const LOCAL_API_BASE_URL = 'http://localhost:3000';
export const NEXA_API_BASE_URL = import.meta.env.VITE_NEXA_API_BASE_URL || 'http://localhost:5068/api/v1';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || NEXA_API_BASE_URL;
export const CORE_BACKEND_ENABLED = import.meta.env.VITE_CORE_BACKEND_ENABLED !== 'false';
export const MOCK_API_FALLBACK_ENABLED = import.meta.env.VITE_ENABLE_MOCK_API_FALLBACK === 'true';

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

export const coreHttp = axios.create({
  baseURL: NEXA_API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

const attachBearerToken = (config) => {
  const token = localStorage.getItem('nexa.token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

http.interceptors.request.use(attachBearerToken);
coreHttp.interceptors.request.use(attachBearerToken);

const handleUnauthorized = (err) => {
  if (err.response?.status === 401 && typeof window !== 'undefined') {
    localStorage.removeItem('nexa.token');
    if (window.location.hash !== '#/auth/login') {
      window.location.assign(`${window.location.origin}${window.location.pathname}#/auth/login`);
    }
  }
  return Promise.reject(err);
};

http.interceptors.response.use(
  (res) => res,
  handleUnauthorized
);

coreHttp.interceptors.response.use((res) => res, handleUnauthorized);

export default http;
