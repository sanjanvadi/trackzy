import axios from 'axios';
import { auth } from './firebase';

// Get API base URL from environment
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add Firebase auth token to all requests
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;

      if (user) {
        // Get fresh Firebase ID token
        const token = await user.getIdToken();
        console.log('token', token);
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Log error for debugging
      console.error(`API Error [${status}]:`, data?.detail || error.message);

      // Handle specific error codes
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          console.error('Unauthorized: Please log in again');
          // You can dispatch a logout action here if needed
          break;
        case 403:
          console.error('Forbidden: Insufficient permissions');
          break;
        case 404:
          console.error('Not found:', data?.detail || 'Resource not found');
          break;
        case 422:
          console.error('Validation error:', data?.detail || 'Invalid data');
          break;
        case 429:
          console.error('Rate limit exceeded');
          break;
        case 500:
          console.error('Server error:', data?.detail || 'Internal server error');
          break;
        default:
          console.error(`Error ${status}:`, data?.detail || error.message);
      }
    } else if (error.request) {
      // Request made but no response received
      console.error('Network error: No response from server');
      console.error('Please check your internet connection or backend is running');
    } else {
      // Error setting up the request
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// API endpoints - matching backend structure
export const endpoints = {
  // Health check
  health: '/health',

  // Users
  users: {
    register: '/users',
    me: '/users/me',
    update: '/users/me',
    delete: '/users/me',
  },

  // Ledgers
  ledgers: {
    list: '/ledgers',
    create: '/ledgers',
    update: (id: string) => `/ledgers/${id}`,
    delete: (id: string) => `/ledgers/${id}`,
    setDefault: (id: string) => `/ledgers/${id}/set-default`,
  },

  // Expenses
  expenses: {
    list: (ledgerId: string) => `/ledgers/${ledgerId}/expenses`,
    summary: (ledgerId: string) => `/ledgers/${ledgerId}/expenses/summary`,
    create: (ledgerId: string) => `/ledgers/${ledgerId}/expenses`,
    get: (ledgerId: string, expenseId: string) =>
      `/ledgers/${ledgerId}/expenses/${expenseId}`,
    update: (ledgerId: string, expenseId: string) =>
      `/ledgers/${ledgerId}/expenses/${expenseId}`,
    delete: (ledgerId: string, expenseId: string) =>
      `/ledgers/${ledgerId}/expenses/${expenseId}`,
  },

  // Voice
  voice: {
    parse: '/voice/parse',
  },
};
