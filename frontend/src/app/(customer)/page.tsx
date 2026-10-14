import React from 'react';
import CityHero from '@/components/home/CityHero';

export const metadata = {
  title: 'Avatar — Find Local Services Near You',
  description: 'Book trusted trade professionals for plumbing, electrical work, cleaning, HVAC repairs, handyman jobs, and more.',
};

export default function HomePage() {
  return <CityHero />;
}
