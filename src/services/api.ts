import axios from 'axios';
import { useAuthStore } from '../store/authStore';

// URL Base dinámica, permitiendo fallback para emulador Android
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de petición para agregar el Bearer Token a solicitudes protegidas
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para cerrar sesión en caso de token vencido/inválido (401)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.warn('Petición no autorizada. Limpiando sesión...');
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
