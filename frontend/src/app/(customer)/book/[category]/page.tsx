import React from 'react';
import Link from 'next/link';
import { getCategoryBySlug } from '@/lib/api/categories';
import { getCategoryIcon, getCategoryDescription } from '@/components/home/CategoryIcons';
import BookingFlow from './BookingFlow';
import styles from './CategoryPage.module.css';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

const FALLBACK_CATEGORIES: Record<string, { name: string; slug: string }> = {
  plumber: { name: 'Plumber', slug: 'plumber' },
  electrician: { name: 'Electrician', slug: 'electrician' },
  cleaning: { name: 'House Cleaning', slug: 'cleaning' },
  hvac: { name: 'HVAC Repair', slug: 'hvac' },
  handyman: { name: 'Handyman', slug: 'handyman' },
  gardening: { name: 'Gardening', slug: 'gardening' },
  moving: { name: 'Moving Services', slug: 'moving' },
  pest: { name: 'Pest Control', slug: 'pest' },
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  let category = null;

  try {
    category = await getCategoryBySlug(params.category);
  } catch (err) {
    console.error('Failed to load category:', err);
  }

  // Fallback if DB is not yet populated
  if (!category && FALLBACK_CATEGORIES[params.category]) {
    const fallback = FALLBACK_CATEGORIES[params.category];
    category = {
      id: params.category,
      name: fallback.name,
      slug: fallback.slug,
      description: '',
      is_active: true,
      created_at: '',
    };
  }

  if (!category) {
    return (
      <div className={styles.pageWrapper}>
        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>Category not found</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
            The requested service category could not be located in our directory.
          </p>
          <Link href="/" className="base-button btn-primary">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const icon = getCategoryIcon(category.slug, category.icon);
  const description = getCategoryDescription(category.slug, category.description);

  return (
    <div className={styles.pageWrapper}>
      {/* Breadcrumb Navigation */}
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/" className={styles.breadcrumbLink}>
          Home
        </Link>
        <span>&rsaquo;</span>
        <Link href="/#categories" className={styles.breadcrumbLink}>
          Services
        </Link>
        <span>&rsaquo;</span>
        <span className={styles.breadcrumbCurrent}>{category.name}</span>
      </nav>

      {/* Category Header Hero Card */}
      <section className={styles.heroHeaderCard}>
        <div className={styles.iconBadge}>{icon}</div>

        <div className={styles.headerContent}>
          <h1 className={styles.categoryTitle}>{category.name} Services</h1>
          <p className={styles.categoryDescription}>{description}</p>

          <div className={styles.trustTags}>
            <span className={styles.trustTag}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Verified Pros
            </span>
            <span className={styles.trustTag}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Transparent Pricing
            </span>
            <span className={styles.trustTag}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Fast Local Response
            </span>
          </div>
        </div>
      </section>

      {/* Interactive Booking Wizard */}
      <BookingFlow category={category} />
    </div>
  );
}
