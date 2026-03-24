import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

/**
 * Standardize error extraction from API responses per Standard #2
 */
export const extractErrorMessage = (err: unknown): string => {
  const error = err as { 
    response?: { 
      data?: { 
        error?: { message?: string };
        message?: string;
      } 
    };
    message?: string;
  };
  return (
    error.response?.data?.error?.message || 
    error.response?.data?.message || 
    error.message || 
    'An unexpected error occurred'
  );
};

// Request Interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor for handling token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and logout
      store.dispatch(logout());
      // No window.location.href here to avoid jarring refresh.
      // The app will redirect to login because isAuthenticated will become false.
    }
    return Promise.reject(error);
  }
);

export default api;
