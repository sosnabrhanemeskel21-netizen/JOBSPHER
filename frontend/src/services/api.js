/**
 * API Service - Axios Configuration
 * 
 * Centralized axios instance for making HTTP requests to the backend API.
 * Includes request/response interceptors for:
 * - Adding JWT authentication token to requests
 * - Handling 401 unauthorized responses (automatic logout)
 * 
 * The base URL can be configured via REACT_APP_API_URL environment variable,
 * defaulting to http://localhost:8080/api for local development.
 * 
 * @author JobSpher Team
 * @version 1.0
 */

import axios from 'axios';

// API base URL - can be overridden via environment variable
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
});


/**
 * Request Interceptor
 * 
 * Automatically adds the JWT token to the Authorization header of all requests.
 * Token is retrieved from localStorage. If no token exists, request proceeds without it.
 */
api.interceptors.request.use(
  (config) => {
    // Get JWT token from localStorage
    const token = localStorage.getItem('token');

    // Add token to Authorization header if it exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * 
 * Handles response errors, particularly 401 Unauthorized responses.
 * If a 401 is received, it means the token is invalid/expired, so we:
 * 1. Clear the token and user data from localStorage
 * 2. Redirect the user to the login page
 */
api.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors (invalid/expired token)
    if (error.response?.status === 401) {
      // Clear authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Redirect to login page
      window.location.href = '/login';
    }

    // Reject the promise with the error for component-level handling
    return Promise.reject(error);
  }
);

export default api;

