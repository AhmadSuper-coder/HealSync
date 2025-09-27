import { apiClient } from './client';

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

export interface RefreshRequest {
  refresh_token: string;
}

export interface RefreshResponse {
  access_token: string;
}

export interface OAuthLoginRequest {
  email: string;
  name: string;
  sub: string;
  picture?: string;
}

export interface OAuthLoginResponse {
  access: string;
  refresh: string;
  created: boolean;
  user: {
    email: string;
    full_name: string;
    sub_id: string | null;
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
   * Login with username/password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return await apiClient.post('/auth/login/', credentials);
  },

  /**
   * Refresh access token
   */
  async refresh(refreshData: RefreshRequest): Promise<RefreshResponse> {
    return await apiClient.post('/auth/refresh/', refreshData);
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

  /**
   * OAuth login with Google profile data
   */
  async googleAuth(profileData: OAuthLoginRequest): Promise<Response> {
    // Use the real OAuth login API endpoint
    const response = await fetch('https://backend.jsonformatters.online/api/accounts/oauth-login/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });
    
    return response;
  },

  /**
   * Refresh token using the OAuth API
   */
  async refreshToken(refreshToken: string): Promise<Response> {
    const response = await fetch('https://backend.jsonformatters.online/api/accounts/refresh-token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refresh: refreshToken,
      }),
    });
    
    return response;
  },
};