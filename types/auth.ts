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
