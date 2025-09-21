import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { toast } from '@/hooks/use-toast';

// Django API error response type
interface DjangoError {
  app_code: string;
  error_code: string;
  error_message: string;
  log_id: string;
}

// Create axios instance with base configuration
const createApiClient = (): AxiosInstance => {
  const baseURL = process.env.NEXT_PUBLIC_DJANGO_API || 'http://localhost:8000/api';
  
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to attach JWT tokens
  client.interceptors.request.use(
    async (config) => {
      try {
        const session = await getSession();
        if (session?.accessToken) {
          config.headers.Authorization = `Bearer ${session.accessToken}`;
        }
      } catch (error) {
        console.error('Error getting session in request interceptor:', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle Django errors
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Return only response.data on success
      return response.data;
    },
    async (error: AxiosError) => {
      // Handle network errors
      if (!error.response) {
        const message = 'Network error. Please check your connection.';
        toast({
          title: 'Connection Error',
          description: message,
          variant: 'destructive',
        });
        return Promise.reject(new Error(message));
      }

      const { status, data } = error.response;

      // Handle 401 - Session expired (ALWAYS, regardless of response format)
      if (status === 401) {
        toast({
          title: 'Session Expired',
          description: 'Session expired',
          variant: 'destructive',
        });
        
        // Auto sign out
        try {
          await signOut({ redirect: false });
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }
        
        return Promise.reject(new Error('Session expired'));
      }

      // Handle Django error format
      if (data && typeof data === 'object' && 'error_message' in data) {
        const djangoError = data as DjangoError;
        
        // Log error details for debugging
        console.error('Django API Error:', {
          app_code: djangoError.app_code,
          error_code: djangoError.error_code,
          error_message: djangoError.error_message,
          log_id: djangoError.log_id,
          status,
          endpoint: error.config?.url,
        });

        // Show error message to user
        toast({
          title: 'Error',
          description: djangoError.error_message,
          variant: 'destructive',
        });

        return Promise.reject(new Error(djangoError.error_message));
      }

      // Handle non-Django error responses
      let message = 'An error occurred';
      switch (status) {
        case 400:
          message = 'Bad request. Please check your input.';
          break;
        case 403:
          message = 'Access forbidden. You do not have permission.';
          break;
        case 404:
          message = 'Resource not found.';
          break;
        case 500:
          message = 'Server error. Please try again later.';
          break;
        default:
          message = `Request failed with status ${status}`;
      }

      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });

      return Promise.reject(new Error(message));
    }
  );

  return client;
};

// Export singleton instance
export const apiClient = createApiClient();

// Export types for use in other modules
export type { DjangoError };