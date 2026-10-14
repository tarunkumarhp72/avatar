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
        <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h2 style={{ color: '#0f1d3f', marginBottom: '1rem' }}>Category not found</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            The requested service category could not be located in our directory.
          </p>
          <Link href="/" className="base-button btn-primary" style={{ padding: '12px 24px', background: '#1a2e5e', color: '#fff', borderRadius: '8px', textDecoration: 'none' }}>
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  const icon = getCategoryIcon(category.slug, category.icon);
  const description = getCategoryDescription(category.slug, category.description) ||
    'Transparent flat-rate pricing & certified master trade technicians dispatched directly to your door.';

  return (
    <div className={styles.pageWrapper}>
      {/* Breadcrumb Navigation */}
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/" className={styles.breadcrumbLink}>
          Home
        </Link>
        <span aria-hidden="true">&rsaquo;</span>
        <Link href="/#services" className={styles.breadcrumbLink}>
          Local Services
        </Link>
        <span aria-hidden="true">&rsaquo;</span>
        <span className={styles.breadcrumbCurrent}>{category.name}</span>
      </nav>

      {/* Category Header Hero Card */}
      <section className={styles.heroHeaderCard} aria-label="Category Overview">
        <div className={styles.headerTopRow}>
          <div className={styles.headerMainInfo}>
            <div className={styles.iconBadge} aria-hidden="true">
              {icon}
            </div>

            <div className={styles.headerTextGroup}>
              <div className={styles.priorityBadge}>
                <span className={styles.pulseDot} aria-hidden="true" />
                <span>PRIORITY DISPATCH ACTIVE</span>
              </div>
              <h1 className={styles.categoryTitle}>
                Book Licensed {category.name} in 60 Seconds
              </h1>
              <p className={styles.categoryDescription}>{description}</p>
            </div>
          </div>

          {/* Upfront Flat-Rate Callout Pill */}
          <div className={styles.rateCalloutCard}>
            <div className={styles.rateIconWrap} aria-hidden="true">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div>
              <span className={styles.rateBold}>Starting at ₹499 / $65</span>
              <span className={styles.rateSub}>Guaranteed flat-rate. No hidden travel fees.</span>
            </div>
          </div>
        </div>

        {/* Trust Badges Strip */}
        <div className={styles.trustStrip}>
          <div className={styles.trustItem}>
            <svg className={styles.trustIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#e8a020" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            <span>Trade Master Certified (#RMP-49102)</span>
          </div>

          <div className={styles.trustItem}>
            <svg className={styles.trustIcon} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span>4.9/5 (820+ Verified Reviews)</span>
          </div>

          <div className={styles.trustItem}>
            <svg className={styles.trustIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            <span>Average 15–30 Min Arrival</span>
          </div>

          <div className={styles.trustItem}>
            <svg className={styles.trustIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f1d3f" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Avatar Shield Escrow Guarantee</span>
          </div>
        </div>
      </section>

      {/* Modern 2-Column Split Booking Wizard */}
      <BookingFlow category={category} />
    </div>
  );
}
