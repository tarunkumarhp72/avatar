import React from 'react';
import Link from 'next/link';
import { getCategories, Category } from '@/lib/api/categories';

export default async function HomePage() {
  let categories: Category[] = [];
  try {
    const data = await getCategories();
    categories = data.items || [];
  } catch (error) {
    console.error('Failed to load categories', error);
  }

  // Fallback data if DB is empty
  if (categories.length === 0) {
    categories = [
      { id: '1', name: 'Plumber', slug: 'plumber', icon: '🔧', description: '', is_active: true },
      { id: '2', name: 'Electrician', slug: 'electrician', icon: '⚡', description: '', is_active: true },
      { id: '3', name: 'House Cleaning', slug: 'cleaning', icon: '🧹', description: '', is_active: true },
      { id: '4', name: 'HVAC Repair', slug: 'hvac', icon: '❄️', description: '', is_active: true },
      { id: '5', name: 'Handyman', slug: 'handyman', icon: '👨‍🔧', description: '', is_active: true },
      { id: '6', name: 'Gardening', slug: 'gardening', icon: '🌱', description: '', is_active: true },
      { id: '7', name: 'Moving Services', slug: 'moving', icon: '🚚', description: '', is_active: true },
      { id: '8', name: 'Pest Control', slug: 'pest', icon: '🐛', description: '', is_active: true },
    ] as any;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Premium Hero Section */}
      <section style={{ 
        backgroundColor: 'var(--color-primary)', 
        color: 'white',
        padding: '6rem 1rem 10rem 1rem',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ 
            fontSize: '3.5rem', 
            fontWeight: 700, 
            lineHeight: 1.2, 
            marginBottom: '1.5rem',
            letterSpacing: '-0.02em'
          }}>
            Find Local Services <br /> near you
          </h1>
          <p style={{ fontSize: '1.125rem', opacity: 0.9, marginBottom: '2.5rem' }}>
            Book trusted professionals for all your home needs, instantly.
          </p>
          
          <div style={{ 
            display: 'flex', 
            gap: '0.5rem', 
            backgroundColor: 'white',
            padding: '0.5rem',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            maxWidth: '650px', 
            margin: '0 auto' 
          }}>
            <input 
              type="text"
              placeholder="What service do you need today? (e.g., Plumber, Cleaning)"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                padding: '0.75rem 1rem',
                fontSize: '1rem',
                color: 'var(--color-text)',
                borderRadius: '8px'
              }}
            />
            <button className="base-button btn-secondary" style={{ 
              borderRadius: '8px', 
              padding: '0 2rem', 
              fontSize: '1.05rem',
              fontWeight: 600
            }}>
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Categories Grid (Overlapping the hero) */}
      <section style={{ 
        maxWidth: '1200px', 
        margin: '-5rem auto 4rem auto',
        padding: '0 1.5rem',
        width: '100%',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {categories.map((cat: any) => (
            <Link 
              href={`/book/${cat.slug}`} 
              key={cat.id}
              style={{ textDecoration: 'none' }}
            >
              <div className="card category-card" style={{ 
                textAlign: 'center', 
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '2.5rem 1.5rem',
                border: '1px solid rgba(0,0,0,0.05)'
              }}>
                <div style={{ 
                  fontSize: '2.5rem', 
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '64px',
                  height: '64px',
                  borderRadius: '16px',
                  backgroundColor: 'var(--color-bg-muted)'
                }}>
                  {cat.icon || '🛠️'}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
