// frontend/src/api/axiosConfig.js
import axios from 'axios';

// L'URL de base est lue depuis le fichier .env (ex: http://127.0.0.1:8081/api)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8081/api';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30s par défaut
  headers: {
    'Accept': 'application/json',
  }
});

// Intercepteur de requête : injecte le Token JWT dans le header
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jwt_token');
    const isJwt = token && token.split('.').length === 3;
    if (isJwt) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;
