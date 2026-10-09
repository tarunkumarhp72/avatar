import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function WorkerJobDetails({ params }: { params: { id: string } }) {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <Link href="/worker/dashboard" style={{ color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem', fontWeight: 500 }}>
        &larr; Back to Dashboard
      </Link>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--color-text-muted)' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)', fontSize: '1.5rem' }}>
              Job #{params.id}
            </h1>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              Scheduled: Today at 2:00 PM
            </p>
          </div>
          <div style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600, backgroundColor: 'var(--color-accent)' }}>
            ACCEPTED
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Customer Details</h3>
          <p style={{ margin: 0 }}>John Doe</p>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>123 Main St, Bangalore</p>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--color-text)', marginBottom: '0.5rem' }}>Problem Description</h3>
          <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>Leaking pipe under sink.</p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
          <Button fullWidth>Start Job</Button>
          <Button variant="secondary" fullWidth>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
