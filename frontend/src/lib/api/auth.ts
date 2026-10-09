import { fetchApi } from './client';

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  user_id: string;
  role: string;
}

export async function sendOtp(data: SendOtpRequest) {
  return fetchApi('/auth/otp/send', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function verifyOtp(data: VerifyOtpRequest): Promise<AuthTokens> {
  return fetchApi('/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
