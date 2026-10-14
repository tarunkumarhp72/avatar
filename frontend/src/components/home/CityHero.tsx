'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ServicePin, { ServicePinProps } from './ServicePin';
import styles from './CityHero.module.css';

interface CityHeroProps {
  initialCategories?: Array<{ id: string; name: string; slug: string }>;
}

const CITY_PINS: Array<Omit<ServicePinProps, 'isActive' | 'onClick'> & { categorySlug: string }> = [
  {
    id: 'pin-plumber',
    icon: '🔧',
    title: 'PLUMBER',
    statusText: '3 Nearby',
    statusType: 'green',
    anchorColor: '#16a34a',
    stemHeight: 52,
    categorySlug: 'plumber',
    x: 20.1,
    y: 52,
    animationDelay: '0s',
  },
  {
    id: 'pin-mechanic',
    icon: '🚗',
    title: 'MECHANIC',
    statusText: '2 Nearby',
    statusType: 'green',
    anchorColor: '#ef4444',
    stemHeight: 44,
    categorySlug: 'handyman',
    x: 13.5,
    y: 85,
    animationDelay: '2.4s',
  },
  {
    id: 'pin-electrician',
    icon: '⚡',
    title: 'ELECTRICIAN',
    statusText: 'Available Now',
    statusType: 'amber',
    anchorColor: '#f0a02b',
    stemHeight: 52,
    categorySlug: 'electrician',
    x: 71.8,
    y: 48,
    animationDelay: '0.6s',
  },
  {
    id: 'pin-maid',
    icon: '🧹',
    title: 'MAID',
    statusText: '4 Nearby',
    statusType: 'green',
    anchorColor: '#334155',
    stemHeight: 48,
    categorySlug: 'cleaning',
    x: 86.4,
    y: 34,
    animationDelay: '1.2s',
  },
  {
    id: 'pin-carpenter',
    icon: '🔨',
    title: 'CARPENTER',
    statusType: 'neutral',
    anchorColor: '#334155',
    stemHeight: 50,
    categorySlug: 'handyman',
    x: 92.5,
    y: 78,
    animationDelay: '1.8s',
  },
];

const DEFAULT_CATEGORIES = [
  { slug: 'plumber', name: 'Plumber' },
  { slug: 'electrician', name: 'Electrician' },
  { slug: 'cleaning', name: 'House Cleaning' },
  { slug: 'hvac', name: 'HVAC Repair' },
  { slug: 'handyman', name: 'Handyman' },
  { slug: 'gardening', name: 'Gardening' },
  { slug: 'moving', name: 'Moving Services' },
  { slug: 'pest', name: 'Pest Control' },
];

export default function CityHero({ initialCategories }: CityHeroProps) {
  const router = useRouter();
  const [jobQuery, setJobQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [activePinId, setActivePinId] = useState<string | null>('pin-electrician');

  const categories = initialCategories && initialCategories.length > 0
    ? initialCategories
    : DEFAULT_CATEGORIES;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const queryParam = jobQuery.trim() ? `?q=${encodeURIComponent(jobQuery.trim())}` : '';
    router.push(`/book/${selectedCategory}${queryParam}`);
  };

  const handlePinClick = (pinId: string, slug: string) => {
    setActivePinId(pinId);
    setSelectedCategory(slug);
  };

  return (
    <>
      <section className={styles.heroWrapper} aria-label="Interactive city services stage">
        {/* Full-Bleed Isometric City Canvas */}
        <div className={styles.cityCanvas} aria-hidden="true" />

        {/* Floating Top-Center Search Overlay */}
        <div className={styles.searchOverlayContainer}>
          <div className={styles.liveBadge} aria-label="System status: Live in your city">
            <span className={styles.liveDot} aria-hidden="true" />
            <span>LIVE IN YOUR CITY</span>
          </div>

          <div className={styles.searchCard}>
            <form onSubmit={handleSearch}>
              <div className={styles.searchUnifiedBox}>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    className={styles.primaryInput}
                    placeholder="What do you need help with?"
                    value={jobQuery}
                    onChange={(e) => setJobQuery(e.target.value)}
                    aria-label="What do you need help with?"
                  />
                  <div className={styles.subInputHint}>
                    (e.g. leaking faucet, bad wiring)
                  </div>
                </div>

                <div className={styles.boxDivider} aria-hidden="true" />

                <div className={styles.categoryGroup}>
                  <select
                    className={styles.categorySelect}
                    value={selectedCategory}
                    onChange={(e) => {
                      setSelectedCategory(e.target.value);
                      const matchingPin = CITY_PINS.find((p) => p.categorySlug === e.target.value);
                      if (matchingPin) setActivePinId(matchingPin.id);
                    }}
                    aria-label="Category selector"
                  >
                    <option value="">Category</option>
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <svg
                    className={styles.selectChevron}
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>

                <button type="submit" className={styles.searchButton} aria-label="Search">
                  Search
                </button>
              </div>
            </form>

            <p className={styles.searchSubtitle}>
              Describe your job • Connect with nearby workers • Book instantly.
            </p>
          </div>
        </div>

        {/* Floating "Upside Tags" (Service Pins over Buildings) */}
        {CITY_PINS.map((pin) => (
          <ServicePin
            key={pin.id}
            id={pin.id}
            icon={pin.icon}
            title={pin.title}
            statusText={pin.statusText}
            statusType={pin.statusType}
            anchorColor={pin.anchorColor}
            stemHeight={pin.stemHeight}
            x={pin.x}
            y={pin.y}
            animationDelay={pin.animationDelay}
            isActive={activePinId === pin.id}
            onClick={() => handlePinClick(pin.id, pin.categorySlug)}
          />
        ))}
      </section>

      {/* Docked Bottom Trust & Scroll Bar */}
      <div className={styles.bottomTrustBar} role="region" aria-label="Trust and navigation bar">
        {/* Left: Trade Tool Icons */}
        <div className={styles.toolIconsGroup} aria-label="Trade icons">
          {/* Wrench in circle */}
          <span className={styles.toolIconItem} title="Plumbing">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </span>

          {/* Crossed wrenches */}
          <span className={styles.toolIconItem} title="Maintenance">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2l-4.5 4.5 3 3L21 5c.5-.5.5-1.5 0-2l-1-1c-.5-.5-1.5-.5-2 0z" />
              <path d="M13.5 6.5L3 17v4h4L17.5 10.5" />
              <path d="M6 2l4.5 4.5-3 3L3 5c-.5-.5-.5-1.5 0-2l1-1c.5-.5 1.5-.5 2 0z" />
              <path d="M10.5 6.5L21 17v4h-4L6.5 10.5" />
            </svg>
          </span>

          {/* Screwdriver and wrench */}
          <span className={styles.toolIconItem} title="Repairs">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 15 6 6m-6-6a4 4 0 0 1-5.66-5.66L15 3l4 4-6.34 6.34" />
              <path d="M5 19l6-6" />
              <path d="M2 22l3-3" />
            </svg>
          </span>

          {/* Verified Worker ID Card */}
          <span className={styles.toolIconItem} title="Verified Providers">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="16" rx="3" />
              <circle cx="9" cy="10" r="2.5" />
              <path d="M15 8h2M15 12h2" />
              <path d="M6 16c0-1.5 1.5-2.5 3-2.5s3 1 3 2.5" />
              <circle cx="17.5" cy="16.5" r="3.5" fill="#16a34a" stroke="#ffffff" strokeWidth="1.5" />
              <path d="m16 16.5 1 1 2-2" stroke="#ffffff" strokeWidth="1.5" />
            </svg>
          </span>
        </div>

        {/* Center: Scroll to discover more indicator */}
        <a href="#how-it-works" className={styles.scrollIndicator} aria-label="Scroll down to discover more">
          <div className={styles.mouseIcon} aria-hidden="true">
            <div className={styles.mouseWheel} />
          </div>
          <span>Scroll to discover more</span>
          <span aria-hidden="true">↓</span>
        </a>

        {/* Right: Trust Metrics */}
        <div className={styles.trustMetricsGroup}>
          <div className={styles.metricItem}>
            <span className={styles.metricIconWrap} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b" stroke="#d97706" strokeWidth="1">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </span>
            <div className={styles.metricTextGroup}>
              <span className={styles.metricBold}>15 Min</span>
              <span className={styles.metricSub}>Avg Arrival</span>
            </div>
          </div>

          <div className={styles.metricItem}>
            <span className={styles.metricIconWrap} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#0d9488" stroke="#0f766e" strokeWidth="1">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className={styles.metricTextGroup}>
              <span className={styles.metricBold}>KYC</span>
              <span className={styles.metricSub}>Verifieds</span>
            </div>
          </div>

          <div className={styles.metricItem}>
            <span className={styles.metricIconWrap} aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#f59e0b" stroke="#d97706" strokeWidth="1">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </span>
            <div className={styles.metricTextGroup}>
              <span className={styles.metricBold}>4.9/5</span>
              <span className={styles.metricSub}>Rating</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
