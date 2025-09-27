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

// ✅ Generic response type
type ApiResponse<T> = Promise<T>;

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
    (error) => Promise.reject(error)
  );

  // Response interceptor to handle Django errors
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // ✅ Return typed response
      return response;
    },
    async (error: AxiosError) => {
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

      if (status === 401) {
        toast({
          title: 'Session Expired',
          description: 'Session expired',
          variant: 'destructive',
        });

        try {
          await signOut({ redirect: false });
        } catch (signOutError) {
          console.error('Error signing out:', signOutError);
        }

        return Promise.reject(new Error('Session expired'));
      }

      if (data && typeof data === 'object' && 'error_message' in data) {
        const djangoError = data as DjangoError;
        console.error('Django API Error:', {
          ...djangoError,
          status,
          endpoint: error.config?.url,
        });

        toast({
          title: 'Error',
          description: djangoError.error_message,
          variant: 'destructive',
        });

        return Promise.reject(new Error(djangoError.error_message));
      }

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

// ✅ Helper functions with generics
export const get = async <T>(url: string, config?: object): ApiResponse<T> => {
  const res = await apiClient.get<T>(url, config);
  return res.data;
};

export const post = async <T, B = unknown>(url: string, body: B, config?: object): ApiResponse<T> => {
  const res = await apiClient.post<T, any>(url, body, config);
  return res.data;
};


export const put = async <T, B = unknown>(url: string, body: B, config?: object): ApiResponse<T> => {
  const res = await apiClient.put<T>(url, body, config);
  return res.data;
};

export const del = async <T>(url: string, config?: object): ApiResponse<T> => {
  const res = await apiClient.delete<T>(url, config);
  return res.data;
};

// Export types for use in other modules
export type { DjangoError, ApiResponse };
