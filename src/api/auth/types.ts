export interface LoginParams {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  accessToken: string;
  refreshToken: string;
}

export interface TwoFactorEnableResponse {
  secret: string;
  qr_svg: string;
}

export interface TwoFactorConfirmParams {
  code: string;
}

export interface TwoFactorVerifyParams {
  code?: string;
  recovery_code?: string;
}

export interface TwoFactorRecoveryCodesResponse {
  message: string;
  recovery_codes: string[];
}

export interface User {
  id: string;
  firstname: string;
  lastname: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  profile_photo_url: string;
  two_factor_enabled: boolean;
  two_factor_verified: boolean;
  email_verified: boolean;
}
