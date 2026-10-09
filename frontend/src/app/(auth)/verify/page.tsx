'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { loginWithOtp } from '@/app/actions/auth';

function VerifyForm() {
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';
  const router = useRouter();

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!phone) {
      router.replace('/login');
    }
  }, [phone, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('OTP is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await loginWithOtp({ phone, otp });
      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        // Redirect based on role
        if (res.role === 'admin') router.push('/admin');
        else if (res.role === 'worker') router.push('/worker/dashboard');
        else router.push('/');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
      setLoading(false);
    }
  };

  if (!phone) return null;

  return (
    <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '1rem' }}>
      <h1 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Verify OTP</h1>
      <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
        We sent a code to {phone}
      </p>
      
      <form onSubmit={handleSubmit}>
        <Input 
          label="One-Time Password" 
          type="text" 
          placeholder="Enter 6-digit code"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          error={error}
          maxLength={6}
        />
        <Button type="submit" fullWidth isLoading={loading} style={{ marginTop: '1rem' }}>
          Verify & Sign In
        </Button>
      </form>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
      <Suspense fallback={<div className="card">Loading...</div>}>
        <VerifyForm />
      </Suspense>
    </div>
  );
}
