import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function WorkerDashboard() {
  // In a real app, fetch worker stats, today's jobs, and current availability status.
  const isOnline = true;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--color-primary)' }}>Worker Dashboard</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 500 }}>Status:</span>
          <div style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600, backgroundColor: isOnline ? 'var(--color-success)' : 'var(--color-text-muted)', color: '#fff' }}>
            {isOnline ? 'ONLINE' : 'OFFLINE'}
          </div>
          <Button variant="secondary" size="sm">Toggle</Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0' }}>Today's Jobs</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: 'var(--color-primary)' }}>3</p>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0' }}>Earnings Today</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: 'var(--color-primary)' }}>₹1,250</p>
          <Link href="/worker/earnings" style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.875rem' }}>View Details</Link>
        </div>
      </div>

      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Upcoming Jobs</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Example Job */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--color-text-muted)', borderRadius: '8px' }}>
            <div>
              <h3 style={{ margin: '0 0 0.25rem 0' }}>Plumbing Repair</h3>
              <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>Today at 2:00 PM</p>
            </div>
            <Link href="/worker/jobs/123" passHref style={{ textDecoration: 'none' }}>
              <Button size="sm">View Details</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
