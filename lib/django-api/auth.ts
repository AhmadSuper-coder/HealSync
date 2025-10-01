import { apiClient, post, get } from './client';
import { DjangoAuthResponse, GoogleProfile, RefreshRequest, RefreshResponse, EmailLoginRequest, EmailSignupRequest, AuthResponse, otpGenResponsePacket, otpGenRequestPacket} from "@/types/auth.ts";




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



  /**
   * Email/password login
   */
  async emailLogin(credentials: EmailLoginRequest): Promise<AuthResponse> {
    return await post<AuthResponse, EmailLoginRequest>(
      "api/accounts/login/",
      credentials
    );
  },

  /**
   * Email signup with full name
   */
  async emailSignup(userData: EmailSignupRequest): Promise<AuthResponse> {
    return await post<AuthResponse, EmailSignupRequest>(
      "api/accounts/signup/",
      userData
    );
  },

  /**
   * Validate email format
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },


    /**
     * send and generate otp to mobile number
     */
    async sendOtpToMobile(data: otpGenRequestPacket): Promise<otpGenResponsePacket> {
        return await post<otpGenResponsePacket, otpGenRequestPacket>(
            "api/otp/generate/",
            data
        );
    },

};

