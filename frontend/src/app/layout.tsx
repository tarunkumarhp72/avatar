import React from 'react';
import '@/styles/globals.css';
import '@/styles/tokens.css';

export const metadata = {
  title: 'Avatar Marketplace',
  description: 'Local services marketplace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
