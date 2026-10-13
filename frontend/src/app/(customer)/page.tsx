import React from 'react';
import { getCategories, Category } from '@/lib/api/categories';
import HomeView from '@/components/home/HomeView';

export const metadata = {
  title: 'Avatar — Find Local Services Near You',
  description: 'Book trusted trade professionals for plumbing, electrical work, cleaning, HVAC repairs, handyman jobs, and more.',
};

export default async function HomePage() {
  let categories: Category[] = [];
  try {
    const data = await getCategories();
    categories = data.items || [];
  } catch (error) {
    console.error('Failed to load categories', error);
  }

  // Fallback data if DB is empty (preserves all 8 core marketplace categories)
  if (categories.length === 0) {
    categories = [
      { id: '1', name: 'Plumber', slug: 'plumber', icon: '🔧', description: '', is_active: true, created_at: '' },
      { id: '2', name: 'Electrician', slug: 'electrician', icon: '⚡', description: '', is_active: true, created_at: '' },
      { id: '3', name: 'House Cleaning', slug: 'cleaning', icon: '🧹', description: '', is_active: true, created_at: '' },
      { id: '4', name: 'HVAC Repair', slug: 'hvac', icon: '❄️', description: '', is_active: true, created_at: '' },
      { id: '5', name: 'Handyman', slug: 'handyman', icon: '👨‍🔧', description: '', is_active: true, created_at: '' },
      { id: '6', name: 'Gardening', slug: 'gardening', icon: '🌱', description: '', is_active: true, created_at: '' },
      { id: '7', name: 'Moving Services', slug: 'moving', icon: '🚚', description: '', is_active: true, created_at: '' },
      { id: '8', name: 'Pest Control', slug: 'pest', icon: '🐛', description: '', is_active: true, created_at: '' },
    ];
  }

  return <HomeView initialCategories={categories} />;
}
