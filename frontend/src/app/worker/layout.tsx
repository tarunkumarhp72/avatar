import React from 'react';
import Link from 'next/link';

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        padding: '1rem 2rem', 
        borderBottom: '1px solid var(--color-text-muted)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--color-primary)',
        color: '#fff'
      }}>
        <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Avatar Worker App</div>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/worker/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/worker/earnings" style={{ color: '#fff', textDecoration: 'none' }}>Earnings</Link>
          <Link href="/worker/profile" style={{ color: '#fff', textDecoration: 'none' }}>Profile</Link>
        </nav>
      </header>
      
      <main style={{ flex: 1, backgroundColor: 'var(--color-bg)' }}>
        {children}
      </main>
    </div>
  );
}
