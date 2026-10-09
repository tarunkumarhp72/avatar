import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ReviewPage({ params }: { params: { id: string } }) {
  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '1.5rem' }}>Leave a Review</h1>
      <div className="card">
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Rating (1-5)</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} style={{ fontSize: '1.5rem', cursor: 'pointer', color: 'var(--color-text-muted)' }}>★</span>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Comments</label>
          <textarea 
            className="base-input w-full"
            rows={4}
            placeholder="How was the service?"
            style={{ padding: '1rem', resize: 'vertical' }}
          />
        </div>
        <Link href={`/bookings/${params.id}`} passHref style={{ textDecoration: 'none' }}>
          <Button fullWidth>Submit Review</Button>
        </Link>
      </div>
    </div>
  );
}
