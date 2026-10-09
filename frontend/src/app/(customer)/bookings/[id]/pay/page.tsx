import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function PaymentPage({ params }: { params: { id: string } }) {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Checkout</h1>
      <div className="card" style={{ textAlign: 'center' }}>
        <p style={{ marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
          Razorpay integration will be loaded here.
        </p>
        <Link href={`/bookings/${params.id}/review`} passHref style={{ textDecoration: 'none' }}>
          <Button fullWidth>Simulate Successful Payment</Button>
        </Link>
      </div>
    </div>
  );
}
