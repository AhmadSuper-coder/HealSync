import { apiClient, post, get } from './client';
import { DjangoAuthResponse, GoogleProfile, RefreshRequest, RefreshResponse} from "@/types/auth.ts";





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
   * Refresh access token
   */
  async refreshToken(data: RefreshRequest): Promise<RefreshResponse> {
    return await post<RefreshResponse, RefreshRequest>('api/auth/token/refresh/', data); 
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
   * Reset password with a token
   */
  async resetPassword(data: {
    token: string;
    new_password: string;
  }): Promise<{ message: string }> {
    return await apiClient.post('/auth/reset-password/', data);
  },



};