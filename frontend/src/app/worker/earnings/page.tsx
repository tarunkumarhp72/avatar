import React from 'react';

export default function WorkerEarnings() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>Earnings & Payouts</h1>
      
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>Summary</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid var(--color-text-muted)' }}>
          <span>Available for Payout</span>
          <strong style={{ fontSize: '1.25rem' }}>₹4,500</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem' }}>
          <span>Total Lifetime Earnings</span>
          <strong>₹12,450</strong>
        </div>
      </div>

      <h2>Recent Transactions</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <strong>Booking #12345</strong>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Oct 9, 2026</div>
          </div>
          <div style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>+₹800</div>
        </div>
      </div>
    </div>
  );
}
