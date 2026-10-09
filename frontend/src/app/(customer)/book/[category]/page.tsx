import React from 'react';
import { getCategoryBySlug } from '@/lib/api/categories';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

import BookingFlow from './BookingFlow';

export default async function CategoryPage({ params }: { params: { category: string } }) {
  let category = null;
  
  try {
    category = await getCategoryBySlug(params.category);
  } catch (err) {
    console.error(err);
  }

  if (!category) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Category not found</h2>
        <Link href="/">Back to Home</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%', maxWidth: '600px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
          {category.icon || '🛠️'}
        </div>
        <h1 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
          {category.name}
        </h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
          {category.description || 'Professional local services at your doorstep. Book now and get connected with verified workers in your area.'}
        </p>
      </div>

      <BookingFlow category={category} />
    </div>
  );
}
