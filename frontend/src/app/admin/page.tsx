import React from 'react';

export default function AdminDashboard() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>Platform Overview</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3 style={{ color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0' }}>Total Bookings</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>1,204</p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0' }}>Active Workers</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0 }}>45</p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0' }}>Pending KYC</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: 'var(--color-accent)' }}>12</p>
        </div>
        <div className="card">
          <h3 style={{ color: 'var(--color-text-muted)', margin: '0 0 0.5rem 0' }}>Revenue (Today)</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: 'var(--color-success)' }}>₹14,500</p>
        </div>
      </div>
    </div>
  );
}
