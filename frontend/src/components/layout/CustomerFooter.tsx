import React from 'react';
import Link from 'next/link';
import styles from './CustomerFooter.module.css';

export default function CustomerFooter() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerGrid}>
          <div className={styles.brandCol}>
            <Link href="/" className={styles.brandHeading}>
              <span>Avatar</span>
            </Link>
            <p className={styles.brandDesc}>
              A modern two-sided local services marketplace connecting homeowners with verified, background-checked trade professionals.
            </p>
            <div className={styles.guaranteeBadge}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Avatar Service Protection</span>
            </div>
          </div>

          <div>
            <h3 className={styles.colHeading}>Popular Services</h3>
            <ul className={styles.linkList}>
              <li><Link href="/book/plumber" className={styles.footerLink}>Plumber</Link></li>
              <li><Link href="/book/electrician" className={styles.footerLink}>Electrician</Link></li>
              <li><Link href="/book/cleaning" className={styles.footerLink}>House Cleaning</Link></li>
              <li><Link href="/book/hvac" className={styles.footerLink}>HVAC Repair</Link></li>
              <li><Link href="/book/handyman" className={styles.footerLink}>Handyman</Link></li>
            </ul>
          </div>

          <div>
            <h3 className={styles.colHeading}>More Categories</h3>
            <ul className={styles.linkList}>
              <li><Link href="/book/gardening" className={styles.footerLink}>Gardening</Link></li>
              <li><Link href="/book/moving" className={styles.footerLink}>Moving Services</Link></li>
              <li><Link href="/book/pest" className={styles.footerLink}>Pest Control</Link></li>
              <li><Link href="/#categories" className={styles.footerLink}>All Services</Link></li>
            </ul>
          </div>

          <div>
            <h3 className={styles.colHeading}>Account & Safety</h3>
            <ul className={styles.linkList}>
              <li><Link href="/login" className={styles.footerLink}>Customer Login</Link></li>
              <li><Link href="/#how-it-works" className={styles.footerLink}>How It Works</Link></li>
              <li><Link href="/#trust" className={styles.footerLink}>Verification Standards</Link></li>
            </ul>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <p className={styles.copyright}>
            &copy; 2026 Avatar Services. All rights reserved.
          </p>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            Built with strict security, upfront pricing, and verified quality.
          </p>
        </div>
      </div>
    </footer>
  );
}
