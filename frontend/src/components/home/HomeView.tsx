'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'framer-motion';
import { Category } from '@/lib/api/categories';
import { getCategoryIcon, getCategoryDescription } from './CategoryIcons';
import styles from './HomeView.module.css';

interface HomeViewProps {
  initialCategories: Category[];
}

export default function HomeView({ initialCategories }: HomeViewProps) {
  const router = useRouter();
  const searchInputId = useId();
  const shouldReduceMotion = useReducedMotion();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter categories by search query
  const filteredCategories = initialCategories.filter((cat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = cat.name.toLowerCase().includes(q);
    const slugMatch = cat.slug.toLowerCase().includes(q);
    const descMatch = (cat.description || '').toLowerCase().includes(q);
    return nameMatch || slugMatch || descMatch;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      const el = document.getElementById('categories');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Check if query matches a known category slug or name
    const exactMatch = initialCategories.find(
      (cat) =>
        cat.slug.toLowerCase() === query ||
        cat.name.toLowerCase() === query ||
        cat.name.toLowerCase().includes(query)
    );

    if (exactMatch) {
      router.push(`/book/${exactMatch.slug}`);
    } else {
      // Scroll down to filtered list
      const el = document.getElementById('categories');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickPillClick = (term: string) => {
    setSearchQuery(term);
    const match = initialCategories.find(
      (cat) =>
        cat.name.toLowerCase().includes(term.toLowerCase()) ||
        cat.slug.toLowerCase().includes(term.toLowerCase())
    );
    if (match) {
      router.push(`/book/${match.slug}`);
    } else {
      const el = document.getElementById('categories');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Motion animation variants (respecting reduced motion)
  const containerVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
        delayChildren: shouldReduceMotion ? 0 : 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 16,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        ease: 'easeOut' as const,
      },
    },
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* 1. Asymmetric Editorial Hero Section */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <div className={styles.trustEyebrow}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Verified Local Trade Network</span>
              </div>

              <h1 className={styles.heroTitle}>
                Find Local Services <br />
                <span className={styles.accentWord}>near you</span>
              </h1>

              <p className={styles.heroSubtitle}>
                Book trusted professionals for all your home needs, instantly.
              </p>

              {/* Main Search Conversion Point */}
              <form
                role="search"
                className={styles.searchForm}
                onSubmit={handleSearchSubmit}
              >
                <div className={styles.searchInputWrapper}>
                  <svg
                    className={styles.searchIcon}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <label htmlFor={searchInputId} style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', clip: 'rect(0,0,0,0)' }}>
                    What service do you need today?
                  </label>
                  <input
                    id={searchInputId}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="What service do you need today? (e.g., Plumber, Cleaning)"
                    className={styles.searchInput}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                        padding: '4px 8px',
                        fontSize: '1.2rem',
                      }}
                      aria-label="Clear search query"
                    >
                      &times;
                    </button>
                  )}
                </div>

                <motion.button
                  type="submit"
                  className={styles.searchSubmitBtn}
                  whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
                  whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
                >
                  <span>Search</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </motion.button>
              </form>

              {/* Quick Suggestion Pills */}
              <div className={styles.quickPillsWrapper}>
                <span className={styles.quickPillsLabel}>Popular:</span>
                {['Plumber', 'Electrician', 'House Cleaning', 'HVAC Repair', 'Handyman'].map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleQuickPillClick(term)}
                    className={styles.quickPill}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Dimensional Platform Preview */}
            <div className={styles.heroCard}>
              <div className={styles.heroCardHeader}>
                <span className={styles.heroCardTitle}>Avatar Platform Standards</span>
                <div className={styles.heroCardStatus}>
                  <span className={styles.statusPip} />
                  <span>Verified Network</span>
                </div>
              </div>

              <ul className={styles.heroFeatureList}>
                <li className={styles.heroFeatureItem}>
                  <div className={styles.featureIconWrap}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: '#ffffff' }}>Identity & Background Checked</strong>
                    <span style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.75)' }}>
                      Every provider passes KYC verification before taking jobs.
                    </span>
                  </div>
                </li>

                <li className={styles.heroFeatureItem}>
                  <div className={styles.featureIconWrap}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: '#ffffff' }}>Transparent Upfront Pricing</strong>
                    <span style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.75)' }}>
                      Clear hourly estimates and quotes with zero surprise fees.
                    </span>
                  </div>
                </li>

                <li className={styles.heroFeatureItem}>
                  <div className={styles.featureIconWrap}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div>
                    <strong style={{ display: 'block', color: '#ffffff' }}>Direct Local Dispatch</strong>
                    <span style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.75)' }}>
                      Connect immediately with nearby specialists ready to visit.
                    </span>
                  </div>
                </li>
              </ul>

              <div className={styles.heroCardFooter}>
                <span>Two-Sided Protection</span>
                <span style={{ color: 'var(--color-accent)' }}>100% Quality Assurance</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Service Categories Section (All 8 Categories Preserved) */}
      <section id="categories" className={styles.categoriesSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Service Directory</span>
            <h2 className={styles.sectionTitle}>Explore All Service Categories</h2>
            <p className={styles.sectionSubtitle}>
              Select a specialized category to connect directly with verified trade specialists in your area.
            </p>
          </div>

          {searchQuery && (
            <div className={styles.searchStateBanner}>
              <span>
                Showing <strong>{filteredCategories.length}</strong> {filteredCategories.length === 1 ? 'service' : 'services'} matching &ldquo;{searchQuery}&rdquo;
              </span>
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery('')}
              >
                Reset search
              </button>
            </div>
          )}

          {filteredCategories.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem', margin: '1rem 0' }}>
              <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                No services found matching &ldquo;{searchQuery}&rdquo;.
              </p>
              <button
                type="button"
                className="base-button btn-primary"
                onClick={() => setSearchQuery('')}
              >
                View all categories
              </button>
            </div>
          ) : (
            <motion.div
              className={styles.categoriesGrid}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
            >
              {filteredCategories.map((cat) => {
                const icon = getCategoryIcon(cat.slug, cat.icon);
                const description = getCategoryDescription(cat.slug, cat.description);

                return (
                  <motion.div
                    key={cat.id}
                    variants={itemVariants}
                    style={{ display: 'flex' }}
                  >
                    <Link
                      href={`/book/${cat.slug}`}
                      className={styles.categoryCard}
                      style={{ width: '100%' }}
                    >
                      <div className={styles.categoryIconBadge}>
                        {icon}
                      </div>

                      <h3 className={styles.categoryName}>
                        {cat.name}
                      </h3>

                      <p className={styles.categoryDesc}>
                        {description}
                      </p>

                      <div className={styles.cardAction}>
                        <span>Book Service</span>
                        <span className={styles.cardActionArrow}>&rarr;</span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* 3. How It Works Section */}
      <section id="how-it-works" className={styles.howSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Simple Process</span>
            <h2 className={styles.sectionTitle}>How Avatar Works</h2>
            <p className={styles.sectionSubtitle}>
              Three straightforward steps from describing your task to getting it completed.
            </p>
          </div>

          <div className={styles.stepsGrid}>
            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>1</div>
              <h3 className={styles.stepTitle}>Choose Your Service</h3>
              <p className={styles.stepText}>
                Select the trade category you require and share basic details about the service needed at your home.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>2</div>
              <h3 className={styles.stepTitle}>Connect with Local Pros</h3>
              <p className={styles.stepText}>
                View verified service providers nearby, confirm appointment timing, and receive upfront transparent quotes.
              </p>
            </div>

            <div className={styles.stepCard}>
              <div className={styles.stepNumber}>3</div>
              <h3 className={styles.stepTitle}>Job Done & Verified</h3>
              <p className={styles.stepText}>
                Your technician visits, executes the work to satisfaction, and you pay securely through the platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Trust & Platform Standards Section */}
      <section id="trust" className={styles.trustSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Built on Trust</span>
            <h2 className={styles.sectionTitle}>Why Homeowners Choose Avatar</h2>
            <p className={styles.sectionSubtitle}>
              Rigorous standards and transparent systems designed for complete peace of mind.
            </p>
          </div>

          <div className={styles.trustGrid}>
            <div className={styles.trustCard}>
              <div className={styles.trustIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <path d="m9 12 2 2 4-4" />
                </svg>
              </div>
              <h3 className={styles.trustCardTitle}>Strict Vetting</h3>
              <p className={styles.trustCardText}>
                Every worker undergoes identity checks, credential verification, and skills assessment.
              </p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <h3 className={styles.trustCardTitle}>Upfront Pricing</h3>
              <p className={styles.trustCardText}>
                Clear pricing guidelines and accurate estimates prior to confirmation. No surprise travel costs.
              </p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3 className={styles.trustCardTitle}>Fast Local Dispatch</h3>
              <p className={styles.trustCardText}>
                Geospatial matching pairs you with qualified specialists currently operating in your immediate vicinity.
              </p>
            </div>

            <div className={styles.trustCard}>
              <div className={styles.trustIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              </div>
              <h3 className={styles.trustCardTitle}>Direct Communication</h3>
              <p className={styles.trustCardText}>
                Direct coordination, real-time arrival tracking, and in-app updates every step of the way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bottom Invitation Strip */}
      <section className={styles.ctaStrip}>
        <div className={`container ${styles.ctaContainer}`}>
          <h2 className={styles.ctaTitle}>Need a reliable pro for your home today?</h2>
          <p className={styles.ctaSubtitle}>
            Browse verified local categories or choose a service to get started immediately.
          </p>
          <a
            href="#categories"
            className={styles.ctaActionBtn}
          >
            Find a Service Pro
          </a>
        </div>
      </section>
    </div>
  );
}
