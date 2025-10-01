// types/auth.ts
export interface GoogleProfile {
  email: string;
  name: string;
  sub: string;       // Google provider account ID
  picture?: string;
}

export interface DjangoAuthResponse {
  access_token: string;
  refresh_token: string;
  created: boolean;
  expires_in: number;
  user: {
    email: string;
    full_name: string;
    sub_id: string | null;
  };
}


export interface RefreshRequest {
  refresh: string;
}



export interface RefreshResponse {
  access: string;
  refresh: string;
}

export interface EmailLoginRequest {
  email: string;
  password: string;
}

export interface EmailSignupRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  created?: boolean;
  user: {
    email: string;
    full_name: string;
    sub_id?: string | null;
  };
}


export interface otpGenRequestPacket {
    identifier: string;
    channel: string;
}

export interface otpGenResponsePacket {
    success: boolean;
    message: string;
    expires_at: number;
    data: {
        identifier: string;
        channel: string;
    }
}


