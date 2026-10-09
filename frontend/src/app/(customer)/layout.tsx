import React from 'react';
import Link from 'next/link';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ 
        padding: '1rem 2rem', 
        borderBottom: '1px solid var(--color-text-muted)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--color-surface, #ffffff)'
      }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 'bold', fontSize: '1.2rem' }}>
          Avatar
        </Link>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/login" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>
            Login
          </Link>
        </nav>
      </header>
      
      <main style={{ flex: 1, backgroundColor: 'var(--color-bg)' }}>
        {children}
      </main>
      
      <footer style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
        &copy; 2026 Avatar Services. All rights reserved.
      </footer>
    </div>
  );
}
