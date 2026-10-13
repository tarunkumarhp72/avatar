import React from 'react';
import { Inter } from 'next/font/google';
import '@/styles/tokens.css';
import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata = {
  title: 'Avatar — Trusted Local Services Marketplace',
  description: 'Book verified local service professionals for plumbing, electrical, cleaning, HVAC, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
