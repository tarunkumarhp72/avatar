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
          <svg
            className={styles.logoIcon}
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect width="36" height="36" rx="8" fill="#1a2e5e" />
            <path
              d="M18 7L8 12V19.5C8 25.5 12.3 31.1 18 32.5C23.7 31.1 28 25.5 28 19.5V12L18 7Z"
              stroke="#e8a020"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.5 19.5L16.5 22.5L22.5 16.5"
              stroke="#ffffff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className={styles.brandTextGroup}>
            <span className={styles.brandName}>Avatar</span>
            <span className={styles.brandTag}>Local Marketplace</span>
          </div>
        </Link>

        <ul className={styles.navLinks}>
          <li>
            <Link href="/#categories" className={styles.navLink}>
              Services
            </Link>
          </li>
          <li>
            <Link href="/#how-it-works" className={styles.navLink}>
              How It Works
            </Link>
          </li>
          <li>
            <Link href="/#trust" className={styles.navLink}>
              Trust & Standards
            </Link>
          </li>
        </ul>

        <div className={styles.actionsGroup}>
          <Link href="/login" className={styles.loginBtn}>
            Login
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
              href="/#categories"
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
              href="/#trust"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Trust & Standards
            </Link>
            <Link
              href="/login"
              className={styles.mobileNavLink}
              onClick={() => setMobileMenuOpen(false)}
            >
              Login to Account
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
