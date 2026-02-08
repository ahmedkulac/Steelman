/**
 * API Client Configuration
 * 
 * Axios instance configured for backend API communication.
 * Features:
 * - Base URL configuration
 * - Request interceptors for authentication (future)
 * - Response interceptors for error handling
 * - Automatic token management
 */

import axios from 'axios';

// API base URL from environment or default to localhost
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

/**
 * Axios instance with base configuration
 */
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * 
 * Adds authentication token to requests if available.
 * Token is stored in localStorage (for future authentication feature).
 */
api.interceptors.request.use(
  (config) => {
    // Only run in browser (not SSR)
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor
 * 
 * Handles common error responses:
 * - 401 Unauthorized: Removes token and redirects to login (future)
 * - Network errors: Provides helpful error messages
 * - Other errors: Passes through for component-level handling
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle network/connection errors
    if (!error.response) {
      // No response means network error or backend not reachable
      if (error.code === 'ECONNREFUSED' || error.message?.includes('Network Error')) {
        error.message = 'Network Error: Cannot connect to backend server. Make sure backend is running on http://localhost:5000';
      }
    }
    
    // Handle unauthorized access (for future authentication)
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      // Redirect to login page when authentication is implemented
      // window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api;
