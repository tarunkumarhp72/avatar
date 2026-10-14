'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Category } from '@/lib/api/categories';
import { getCategoryIcon, getCategoryDescription } from './CategoryIcons';
import styles from './HomeView.module.css';

interface HomeViewProps {
  initialCategories: Category[];
}

interface ProfessionGear {
  title: string;
  gear: string;
  image: string;
  accent: string;
}

const PROFESSIONS: Record<string, ProfessionGear> = {
  plumber: {
    title: 'Master Plumber',
    gear: 'Yellow safety hard hat, turquoise workwear & chrome pipe wrench',
    image: '/mascot/plumber.jpg',
    accent: '#0284c7',
  },
  electrician: {
    title: 'Certified Electrician',
    gear: 'Electrician helmet, insulated screwdriver & warm illuminated bulb',
    image: '/mascot/electrician.jpg',
    accent: '#eab308',
  },
  cleaning: {
    title: 'House Cleaning Specialist',
    gear: 'Teal housekeeping apron, spray bottle & microfiber cloth',
    image: '/mascot/cleaning.jpg',
    accent: '#0d9488',
  },
  hvac: {
    title: 'HVAC Technician',
    gear: 'Utility technician vest, pressure gauges & diagnostic tools',
    image: '/mascot/hvac.jpg',
    accent: '#3b82f6',
  },
  handyman: {
    title: 'General Handyman',
    gear: 'Classic denim overalls, tool belt & heavy-duty toolbox',
    image: '/mascot/handyman.jpg',
    accent: '#d97706',
  },
  gardening: {
    title: 'Landscape & Garden Pro',
    gear: 'Garden work apron, gloves, potted plant & hand trowel',
    image: '/mascot/gardening.jpg',
    accent: '#16a34a',
  },
  moving: {
    title: 'Moving & Transport Specialist',
    gear: 'Mover uniform cap, polo shirt & heavy-duty cargo crate',
    image: '/mascot/moving.jpg',
    accent: '#2563eb',
  },
  pest: {
    title: 'Pest Control Inspector',
    gear: 'Protective exterminator jumpsuit & digital inspection scanner',
    image: '/mascot/pest.jpg',
    accent: '#854d0e',
  },
};

export default function HomeView({ initialCategories }: HomeViewProps) {
  const router = useRouter();
  const searchInputId = useId();
  const shouldReduceMotion = useReducedMotion();

  // Active Category & Mascot State (Plumber by default)
  const [activeSlug, setActiveSlug] = useState<string>('plumber');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeCategory =
    initialCategories.find((cat) => cat.slug === activeSlug) ||
    initialCategories[0] || {
      id: '1',
      name: 'Plumber',
      slug: 'plumber',
    };

  const currentProfession = PROFESSIONS[activeCategory.slug] || PROFESSIONS['plumber'];

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

    // Direct match check
    const exactMatch = initialCategories.find(
      (cat) =>
        cat.slug.toLowerCase() === query ||
        cat.name.toLowerCase() === query ||
        cat.name.toLowerCase().includes(query)
    );

    if (exactMatch) {
      setActiveSlug(exactMatch.slug);
      router.push(`/book/${exactMatch.slug}`);
    } else {
      const el = document.getElementById('categories');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickPillClick = (slug: string) => {
    setActiveSlug(slug);
    const el = document.getElementById('categories');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategorySelect = (slug: string) => {
    setActiveSlug(slug);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* 1. Hero Section with Interactive 3D Service Mascot */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.heroGrid}>
            {/* Left Column: Heading, Subtext & Search */}
            <div className={styles.heroContent}>
              <div className={styles.trustEyebrow}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Verified Local Trade Network</span>
              </div>

              <h1 className={styles.heroTitle}>
                Your home, <br />
                <span className={styles.accentWord}>handled.</span>
              </h1>

              <p className={styles.heroSubtitle}>
                Trusted local pros, one friendly place.
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

              {/* Trust line beneath search */}
              <div className={styles.trustBarUnderSearch}>
                <span>✓ Verified background checks</span>
                <span className={styles.trustDot}>•</span>
                <span>Upfront transparent pricing</span>
                <span className={styles.trustDot}>•</span>
                <span>Guaranteed satisfaction</span>
              </div>

              {/* Quick Suggestion Pills */}
              <div className={styles.quickPillsWrapper}>
                <span className={styles.quickPillsLabel}>Switch Mascot:</span>
                {[
                  { label: 'Plumber', slug: 'plumber' },
                  { label: 'Electrician', slug: 'electrician' },
                  { label: 'House Cleaning', slug: 'cleaning' },
                  { label: 'HVAC Repair', slug: 'hvac' },
                  { label: 'Handyman', slug: 'handyman' },
                ].map((item) => (
                  <button
                    key={item.slug}
                    type="button"
                    onClick={() => handleQuickPillClick(item.slug)}
                    className={styles.quickPill}
                    style={
                      activeSlug === item.slug
                        ? { background: 'var(--color-accent)', color: '#1a1a1a', borderColor: 'var(--color-accent)', fontWeight: 700 }
                        : {}
                    }
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: 3D Interactive Mascot Stage */}
            <div className={styles.mascotStage}>
              <div className={styles.mascotViewport}>
                <div className={styles.mascotGlowBackdrop} />

                {/* Animated Mascot Character Switcher */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCategory.slug}
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 1.05, y: -10 }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                    style={{ width: '100%', height: '100%', position: 'relative' }}
                  >
                    <Image
                      src={currentProfession.image}
                      alt={`Avatar 3D mascot in ${currentProfession.title} uniform`}
                      width={440}
                      height={440}
                      priority
                      className={styles.mascotImage}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Top Badge: Active Trade */}
                <div className={styles.mascotTopBadge}>
                  <span className={styles.mascotActiveDot} />
                  <span>{currentProfession.title}</span>
                </div>

                {/* Bottom Overlay Card */}
                <div className={styles.mascotBottomCard}>
                  <div className={styles.mascotCardDetails}>
                    <span className={styles.mascotCardName}>{activeCategory.name} Gear</span>
                    <span className={styles.mascotCardGear}>{currentProfession.gear}</span>
                  </div>
                  <Link href={`/book/${activeCategory.slug}`} className={styles.mascotCardAction}>
                    <span>Book Pro &rarr;</span>
                  </Link>
                </div>
              </div>

              <div className={styles.mascotHelperHint}>
                <span>💡 Click any category below to switch mascot profession & gear</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Interactive Service Categories (Immediately below hero) */}
      <section id="categories" className={styles.categoriesSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>Select a Trade</span>
            <h2 className={styles.sectionTitle}>Explore Service Categories</h2>
            <p className={styles.sectionSubtitle}>
              Click a card to equip the mascot and preview specialized services, or proceed to instant booking.
            </p>
          </div>

          <div className={styles.categoriesGrid}>
            {filteredCategories.map((cat) => {
              const icon = getCategoryIcon(cat.slug, cat.icon);
              const description = getCategoryDescription(cat.slug, cat.description);
              const isSelected = activeSlug === cat.slug;

              return (
                <div
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`${styles.categoryCard} ${isSelected ? styles.categoryCardActive : ''}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleCategorySelect(cat.slug);
                    }
                  }}
                  aria-pressed={isSelected}
                >
                  {isSelected && (
                    <span className={styles.activeMascotBadge}>
                      Mascot Equipped
                    </span>
                  )}

                  <div className={styles.categoryIconBadge}>
                    {icon}
                  </div>

                  <h3 className={styles.categoryName}>
                    {cat.name}
                  </h3>

                  <p className={styles.categoryDesc}>
                    {description}
                  </p>

                  <div className={styles.cardBottomRow}>
                    <span style={{ fontSize: '0.78rem', color: isSelected ? 'var(--color-accent)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                      {isSelected ? '✓ Active Profession' : 'Click to equip'}
                    </span>
                    <Link
                      href={`/book/${cat.slug}`}
                      className={styles.cardAction}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span>Book</span>
                      <span className={styles.cardActionArrow}>&rarr;</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
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
