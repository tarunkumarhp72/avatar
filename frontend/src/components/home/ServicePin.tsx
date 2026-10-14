'use client';

import React from 'react';
import styles from './ServicePin.module.css';

export interface ServicePinProps {
  id: string;
  icon: string;
  title: string;
  statusText?: string;
  statusType?: 'green' | 'amber' | 'neutral';
  anchorColor?: string;
  stemHeight?: number;
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
  animationDelay?: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function ServicePin({
  icon,
  title,
  statusText,
  statusType = 'green',
  anchorColor = '#16a34a',
  stemHeight = 44,
  x,
  y,
  animationDelay = '0s',
  isActive = false,
  onClick,
}: ServicePinProps) {
  const isAmber = statusType === 'amber';

  return (
    <div
      className={`${styles.pinWrapper} ${isActive ? styles.active : ''}`}
      style={{
        left: `${x}%`,
        top: `${y}%`,
      }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`${title} service pin: ${statusText || 'available'}`}
    >
      <div
        className={`${styles.pinCard} ${isAmber ? styles.amberHighlight : ''}`}
        style={{ animationDelay }}
      >
        <span className={styles.pinIcon} aria-hidden="true">{icon}</span>
        <span className={styles.pinTitle}>{title}</span>

        {statusText && (
          <>
            <span className={styles.pinDivider} aria-hidden="true">•</span>
            <div className={styles.pinStatusGroup}>
              <span>{statusText}</span>
              {statusType === 'green' && (
                <span className={`${styles.statusDot} ${styles.statusDotGreen}`} aria-hidden="true" />
              )}
            </div>
          </>
        )}
      </div>

      <div className={styles.connectorStem} style={{ height: `${stemHeight}px` }} />
      <div className={styles.anchorDot} style={{ backgroundColor: anchorColor }} />
    </div>
  );
}
