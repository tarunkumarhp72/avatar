'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { sendOtp } from '@/lib/api/auth';

export default function LoginPage() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('Phone number is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendOtp({ phone });
      // Redirect to verify page with phone as query param
      router.push(`/verify?phone=${encodeURIComponent(phone)}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', margin: '1rem' }}>
        <h1 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Welcome Back</h1>
        <p style={{ marginBottom: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Enter your phone number to sign in or create an account.</p>
        
        <form onSubmit={handleSubmit}>
          <Input 
            label="Phone Number" 
            type="tel" 
            placeholder="+91..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={error}
          />
          <Button type="submit" fullWidth isLoading={loading} style={{ marginTop: '1rem' }}>
            Send OTP
          </Button>
        </form>
      </div>
    </div>
  );
}
