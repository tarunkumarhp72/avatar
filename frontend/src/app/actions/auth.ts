'use server';

import { cookies } from 'next/headers';
import { verifyOtp, VerifyOtpRequest } from '@/lib/api/auth';
import { redirect } from 'next/navigation';

export async function loginWithOtp(data: VerifyOtpRequest) {
  try {
    // We cannot use fetchApi proxy from a server action since proxy is for browser.
    // So we must fetch the backend directly from the server.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';
    const response = await fetch(`${apiUrl}/auth/otp/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { error: errorData.error?.message || 'Invalid OTP' };
    }

    const tokens = await response.json();
    
    // Set HTTP-only cookie
    cookies().set('access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 15 * 60, // 15 mins
    });
    
    cookies().set('refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    cookies().set('user_role', tokens.role, {
      httpOnly: false, // Allowed to be read by client for routing
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
    });
    
    return { success: true, role: tokens.role };
  } catch (error: any) {
    return { error: error.message || 'An error occurred' };
  }
}

export async function logout() {
  cookies().delete('access_token');
  cookies().delete('refresh_token');
  cookies().delete('user_role');
  redirect('/login');
}
