import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function AdminWorkers() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '2rem' }}>Worker Management & KYC</h1>
      
      <div className="card">
        <h2 style={{ marginBottom: '1rem' }}>Pending KYC Approvals</h2>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-text-muted)' }}>
              <th style={{ padding: '1rem 0' }}>Name</th>
              <th style={{ padding: '1rem 0' }}>Phone</th>
              <th style={{ padding: '1rem 0' }}>Category</th>
              <th style={{ padding: '1rem 0' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--color-bg)' }}>
              <td style={{ padding: '1rem 0' }}>Jane Smith</td>
              <td style={{ padding: '1rem 0' }}>+91 9876543210</td>
              <td style={{ padding: '1rem 0' }}>Electrician</td>
              <td style={{ padding: '1rem 0' }}>
                <Button size="sm">Review Docs</Button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
