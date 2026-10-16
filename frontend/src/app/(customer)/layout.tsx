'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import CustomerHeader from '@/components/layout/CustomerHeader';
import CustomerFooter from '@/components/layout/CustomerFooter';

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isBookingPage = pathname?.startsWith('/book');

  if (isHomePage) {
    return <main style={{ width: '100vw', height: '100vh', overflow: 'hidden', margin: 0, padding: 0 }}>{children}</main>;
  }

  if (isBookingPage) {
    return <main style={{ minHeight: '100vh', backgroundColor: '#f6f4ee' }}>{children}</main>;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <CustomerHeader />
      <main style={{ flex: 1, backgroundColor: 'var(--color-bg)' }}>
        {children}
      </main>
      <CustomerFooter />
    </div>
  );
}
