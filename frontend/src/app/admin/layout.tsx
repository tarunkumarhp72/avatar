import React from 'react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      <aside style={{ 
        width: '250px', 
        backgroundColor: '#111827', 
        color: '#fff', 
        padding: '2rem 1rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem', padding: '0 1rem' }}>
          Avatar Admin
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link href="/admin" style={{ padding: '0.75rem 1rem', color: '#fff', textDecoration: 'none', borderRadius: '8px' }}>
            Dashboard
          </Link>
          <Link href="/admin/workers" style={{ padding: '0.75rem 1rem', color: '#fff', textDecoration: 'none', borderRadius: '8px' }}>
            Workers & KYC
          </Link>
          <Link href="/admin/bookings" style={{ padding: '0.75rem 1rem', color: '#fff', textDecoration: 'none', borderRadius: '8px' }}>
            All Bookings
          </Link>
        </nav>
      </aside>
      
      <main style={{ flex: 1, backgroundColor: 'var(--color-bg)', padding: '2rem' }}>
        {children}
      </main>
    </div>
  );
}
