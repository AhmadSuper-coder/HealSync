import { apiClient, post, get } from './client';
import { DjangoAuthResponse, GoogleProfile, RefreshRequest, RefreshResponse} from "../../types/auth";


// Auth-related types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}



export interface UserProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
  last_login: string;
}

// Auth API methods
export const AuthAPI = {

  /**
   * google Oauth authentication
   */
  // async googleAuth(data: { email: string; name: string; sub: string; picture?: string }) {
  //   return await apiClient.post('api/accounts/oauth-login/', data);
  // },

  async googleAuth(data: GoogleProfile): Promise<DjangoAuthResponse> {
    return await post<DjangoAuthResponse, GoogleProfile>(
      "api/accounts/oauth-login/",
      data
    );
  },

  /**
   * Login with username/password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return await apiClient.post('/auth/login/', credentials);
  },

  /**
   * Refresh access token
   */
  async refreshToken(data: RefreshRequest): Promise<RefreshResponse> {
    return await post<RefreshResponse, RefreshRequest>('api/auth/token/refresh/', data); 
  },

  /**
   * Get current user profile
   */
  async profile(): Promise<UserProfile> {
    return await apiClient.get('/auth/profile/');
  },

  /**
   * Logout (invalidate tokens)
   */
  async logout(): Promise<{ message: string }> {
    return await apiClient.post('/auth/logout/');
  },

  /**
   * Change password
   */
  async changePassword(data: {
    old_password: string;
    new_password: string;
  }): Promise<{ message: string }> {
    return await apiClient.post('/auth/change-password/', data);
  },

  /**
   * Send password reset email
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return await apiClient.post('/auth/forgot-password/', { email });
  },

  /**
   * Reset password with token
   */
  async resetPassword(data: {
    token: string;
    new_password: string;
  }): Promise<{ message: string }> {
    return await apiClient.post('/auth/reset-password/', data);
  },
};