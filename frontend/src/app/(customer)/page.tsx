import React from 'react';

export const metadata = {
  title: 'Avatar — Find Local Services Near You',
  description: 'Book trusted trade professionals for plumbing, electrical work, cleaning, HVAC repairs, handyman jobs, and more.',
};

export default function HomePage() {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        position: 'relative',
        margin: 0,
        padding: 0,
        backgroundColor: '#faf9f5',
      }}
    >
      <iframe
        src="/avatar-city-hero.html"
        title="Avatar — Interactive Animated City"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          overflow: 'hidden',
        }}
      />
    </div>
  );
}

