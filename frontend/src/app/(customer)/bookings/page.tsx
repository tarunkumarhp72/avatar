import React from 'react';
import Link from 'next/link';
import { getMyBookings, BookingResponse } from '@/lib/api/bookings';

export default async function BookingsPage() {
  let bookings: BookingResponse[] = [];
  
  try {
    const data = await getMyBookings();
    bookings = data.items || [];
  } catch (err) {
    console.error(err);
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>You have no bookings yet.</p>
          <Link href="/" style={{ color: 'var(--color-primary)', fontWeight: 500, textDecoration: 'none' }}>
            Book a service
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {bookings.map((b) => (
            <Link key={b.id} href={`/bookings/${b.id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-text)' }}>Booking #{b.id.substring(0, 8)}</h3>
                  <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
                    {new Date(b.scheduled_time).toLocaleString()}
                  </p>
                </div>
                <div style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: b.status === 'COMPLETED' ? 'var(--color-success)' : 'var(--color-accent)', color: b.status === 'COMPLETED' ? '#fff' : '#000' }}>
                  {b.status}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
