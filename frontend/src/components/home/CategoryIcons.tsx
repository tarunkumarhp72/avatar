import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export function PlumberIcon({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

export function ElectricianIcon({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function CleaningIcon({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

export function HvacIcon({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    </svg>
  );
}

export function HandymanIcon({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M15 12l-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9" />
      <path d="M17.64 4.36a9 9 0 0 0-9.28 2.22l5.74 5.74a3 3 0 0 1 3.54.55l3.54-3.54a3 3 0 0 1 .55-3.54 9 9 0 0 0-4.09-1.43z" />
    </svg>
  );
}

export function GardeningIcon({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

export function MovingIcon({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

export function PestIcon({ className, size = 28 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect width="8" height="14" x="8" y="6" rx="4" />
      <path d="m19 7-3 2" />
      <path d="m5 7 3 2" />
      <path d="m19 19-3-2" />
      <path d="m5 19 3-2" />
      <path d="M20 13h-4" />
      <path d="M4 13h4" />
      <path d="m10 4 1 2" />
      <path d="m14 4-1 2" />
    </svg>
  );
}

export function getCategoryIcon(slug: string, fallbackEmoji?: string) {
  switch (slug.toLowerCase()) {
    case 'plumber':
      return <PlumberIcon />;
    case 'electrician':
      return <ElectricianIcon />;
    case 'cleaning':
    case 'house-cleaning':
      return <CleaningIcon />;
    case 'hvac':
    case 'hvac-repair':
      return <HvacIcon />;
    case 'handyman':
      return <HandymanIcon />;
    case 'gardening':
      return <GardeningIcon />;
    case 'moving':
    case 'moving-services':
      return <MovingIcon />;
    case 'pest':
    case 'pest-control':
      return <PestIcon />;
    default:
      return <HandymanIcon />;
  }
}

export function getCategoryDescription(slug: string, fallback?: string): string {
  if (fallback && fallback.trim().length > 0) return fallback;

  switch (slug.toLowerCase()) {
    case 'plumber':
      return 'Pipe leak repairs, drain cleaning, fixtures & water heaters';
    case 'electrician':
      return 'Wiring, outlets, lighting fixtures, breakers & panel upgrades';
    case 'cleaning':
    case 'house-cleaning':
      return 'Comprehensive home cleaning, deep cleaning & move-out service';
    case 'hvac':
    case 'hvac-repair':
      return 'Heating & AC repairs, seasonal tune-ups & thermostat setups';
    case 'handyman':
      return 'Furniture assembly, drywall patching, mounting & general fixes';
    case 'gardening':
      return 'Lawn mowing, hedge trimming, weeding & seasonal yard care';
    case 'moving':
    case 'moving-services':
      return 'Local relocation, heavy item moving, packing & unloading';
    case 'pest':
    case 'pest-control':
      return 'Targeted insect inspection, rodent control & prevention plans';
    default:
      return 'Professional local service by verified trade specialists';
  }
}
