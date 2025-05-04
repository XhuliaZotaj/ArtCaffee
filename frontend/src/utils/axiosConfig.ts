import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-toastify';

// Create a pre-configured axios instance for API calls
const API_BASE_URL = "http://localhost:5000";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Don't send cookies for cross-origin requests
});

// Add an interceptor to add authentication token to requests
apiClient.interceptors.request.use((config: AxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response) {
      // The request was made and the server responded with an error status
      console.error('API error:', error.response.status, error.response.data);
      
      // Handle authentication errors
      if (error.response.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        // Optionally redirect to login page
        // window.location.href = '/login';
      } else if (error.response.status === 403) {
        toast.error('You do not have permission to perform this action');
      } else if (error.response.status === 422 || error.response.status === 400) {
        // Validation errors
        const data = error.response.data as any;
        if (data.error) {
          toast.error(data.error);
        } else {
          toast.error('Validation error. Please check your input.');
        }
      } else if (error.response.status >= 500) {
        toast.error('Server error. Please try again later.');
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API request error, no response received:', error.request);
      toast.error('Network error. Please check your connection and try again.');
    } else {
      // Something happened in setting up the request
      console.error('API setup error:', error.message);
      toast.error('An unexpected error occurred. Please try again.');
    }
    
    // Rethrow the error to let components handle it
    return Promise.reject(error);
  }
);

export default apiClient; 