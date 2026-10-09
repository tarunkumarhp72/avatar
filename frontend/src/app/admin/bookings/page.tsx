import React from 'react';

export default function AdminBookings() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>All Bookings</h1>
      
      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-text-muted)' }}>
              <th style={{ padding: '1rem 0' }}>ID</th>
              <th style={{ padding: '1rem 0' }}>Customer</th>
              <th style={{ padding: '1rem 0' }}>Worker</th>
              <th style={{ padding: '1rem 0' }}>Status</th>
              <th style={{ padding: '1rem 0' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--color-bg)' }}>
              <td style={{ padding: '1rem 0' }}>#12345</td>
              <td style={{ padding: '1rem 0' }}>John Doe</td>
              <td style={{ padding: '1rem 0' }}>Mike Fixit</td>
              <td style={{ padding: '1rem 0' }}>
                <span style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', backgroundColor: 'var(--color-success)', color: '#fff', fontSize: '0.75rem' }}>COMPLETED</span>
              </td>
              <td style={{ padding: '1rem 0' }}>₹850</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
