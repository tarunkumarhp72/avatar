'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import styles from './CustomerHeader.module.css';

export default function CustomerHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.navContainer}`}>
        <Link href="/" className={styles.brand} aria-label="Avatar Local Services Marketplace">
          <span className={styles.brandName}>AVATAR</span>
        </Link>

        <ul className={styles.navLinks}>
          <li>
            <Link href="/#services" className={styles.navLink}>
              Services
            </Link>
          </li>
          <li>
            <Link href="/#how-it-works" className={styles.navLink}>
              How It Works
            </Link>
          </li>
          <li>
            <Link href="/#workers" className={styles.navLink}>
              Workers
            </Link>
          </li>
        </ul>

        <div className={styles.actionsGroup}>
          <Link href="/provider/register" className={styles.providerBtn}>
            Become a Provider
          </Link>
          <Link href="/book/plumber" className={styles.bookNowBtn}>
            Book Now
          </Link>

          <button
            type="button"
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className={styles.mobileDropdown} aria-label="Mobile navigation">
          <div className="container" style={{ display: 'flex', flexDirection: 'column' }}>
            <Link
              href="/#services"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Services
            </Link>
            <Link
              href="/#how-it-works"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link
              href="/#workers"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Workers
            </Link>
            <Link
              href="/provider/register"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Become a Provider
            </Link>
            <Link
              href="/book/plumber"
              className={styles.mobileNavLinkCta}
              onClick={() => setMobileMenuOpen(false)}
            >
              Book Now
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
