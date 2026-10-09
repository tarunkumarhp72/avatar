import React from 'react';
import Link from 'next/link';
import { getBookingById } from '@/lib/api/bookings';
import { Button } from '@/components/ui/Button';

export default async function BookingDetailPage({ params }: { params: { id: string } }) {
  let booking = null;
  
  try {
    booking = await getBookingById(params.id);
  } catch (err) {
    console.error(err);
  }

  if (!booking) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Booking not found</h2>
        <Link href="/bookings">Back to Bookings</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Link href="/bookings" style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem', fontWeight: 500 }}>
        &larr; Back to Bookings
      </Link>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-text-muted)' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)', fontSize: '1.5rem' }}>
              Booking #{booking.id.substring(0, 8)}
            </h1>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              Scheduled for: {new Date(booking.scheduled_time).toLocaleString()}
            </p>
          </div>
          <div style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600, backgroundColor: booking.status === 'COMPLETED' ? 'var(--color-success)' : 'var(--color-accent)', color: booking.status === 'COMPLETED' ? '#fff' : '#000' }}>
            {booking.status}
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Problem Description</h3>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.5, margin: 0 }}>
            {booking.problem_description}
          </p>
        </div>

        {booking.status === 'COMPLETED' && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <Link href={`/bookings/${booking.id}/pay`} passHref style={{ flex: 1, textDecoration: 'none' }}>
              <Button fullWidth>Make Payment</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
