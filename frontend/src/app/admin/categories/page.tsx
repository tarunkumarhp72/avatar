'use client';

import React, { useState, useEffect } from 'react';
import { 
  Category, 
  CategoryIssue, 
  getAdminCategories, 
  createCategory, 
  updateCategory, 
  deleteCategory 
} from '@/lib/api/categories';
import { Button } from '@/components/ui/Button';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal / Editor State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [noun, setNoun] = useState('');
  const [basePrice, setBasePrice] = useState(599);
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [items, setItems] = useState<CategoryIssue[]>([]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAdminCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
      setError(err?.message || 'Failed to load categories from database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setNoun('');
    setBasePrice(599);
    setDescription('');
    setIsActive(true);
    setItems([
      { id: 'general', name: 'General Inspection & Fix', desc: 'Standard diagnosis and repair · 1–2 hrs', time: '1–2 hrs', add: 0, em: false }
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setSlug(cat.slug || '');
    setNoun(cat.noun || '');
    setBasePrice(cat.base_price ?? 599);
    setDescription(cat.description || '');
    setIsActive(cat.is_active);
    setItems(cat.items && cat.items.length > 0 ? JSON.parse(JSON.stringify(cat.items)) : []);
    setIsModalOpen(true);
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      await updateCategory(cat.id, { is_active: !cat.is_active });
      setSuccessMsg(`Category "${cat.name}" status updated.`);
      setTimeout(() => setSuccessMsg(null), 3500);
      fetchCategories();
    } catch (err: any) {
      alert(`Failed to update status: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (!window.confirm(`Are you sure you want to deactivate/delete "${cat.name}"?`)) return;
    try {
      await deleteCategory(cat.id);
      setSuccessMsg(`Category "${cat.name}" removed.`);
      setTimeout(() => setSuccessMsg(null), 3500);
      fetchCategories();
    } catch (err: any) {
      alert(`Failed to delete category: ${err?.message || 'Unknown error'}`);
    }
  };

  // Sub-services / Issues Handlers
  const handleAddItem = () => {
    const newId = `sub_${Date.now().toString(36)}`;
    setItems(prev => [
      ...prev,
      { id: newId, name: '', desc: '', time: '1–2 hrs', add: 0, em: false }
    ]);
  };

  const handleUpdateItem = (index: number, field: keyof CategoryIssue, value: any) => {
    setItems(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Category name is required.');
      return;
    }
    const computedSlug = (slug.trim() || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));

    // Clean items
    const cleanItems = items.filter(i => i.name.trim()).map(i => ({
      id: i.id || i.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      name: i.name.trim(),
      desc: i.desc?.trim() || '',
      time: i.time?.trim() || '',
      add: Number(i.add) || 0,
      em: Boolean(i.em)
    }));

    setSaving(true);
    try {
      const payload: Partial<Category> = {
        name: name.trim(),
        slug: computedSlug,
        noun: noun.trim() || `a ${name.trim().toLowerCase()}`,
        base_price: Number(basePrice) || 0,
        description: description.trim(),
        is_active: isActive,
        items: cleanItems
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        setSuccessMsg(`Category "${payload.name}" updated successfully.`);
      } else {
        await createCategory(payload);
        setSuccessMsg(`Category "${payload.name}" created successfully.`);
      }

      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(null), 4000);
      fetchCategories();
    } catch (err: any) {
      console.error('Save failed:', err);
      alert(`Failed to save category: ${err?.message || 'Server error'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', color: 'var(--color-text)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ color: 'var(--color-primary)', margin: 0, fontSize: '1.875rem', fontWeight: 800 }}>
            Categories & Services
          </h1>
          <p style={{ margin: '0.35rem 0 0 0', color: 'var(--color-text-secondary)', fontSize: '0.95rem' }}>
            Manage home dropdown options, booking flow sub-services, starting pricing, and emergency tasks.
          </p>
        </div>
        <Button onClick={openCreateModal} variant="primary">
          + Add New Category
        </Button>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          ✓ {successMsg}
        </div>
      )}

      {error && (
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#991b1b',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Table Card */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid var(--color-border)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
            Loading categories from database...
          </div>
        ) : categories.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>No categories found in database.</p>
            <Button onClick={openCreateModal} variant="primary">Create First Category</Button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.925rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-bg-muted)', borderBottom: '1px solid var(--color-border)' }}>
                  <th style={{ padding: '1rem 1.25rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Service Name</th>
                  <th style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Slug</th>
                  <th style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Specialist Noun</th>
                  <th style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Base Price</th>
                  <th style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Sub-services</th>
                  <th style={{ padding: '1rem', fontWeight: 700, color: 'var(--color-text-secondary)' }}>Status</th>
                  <th style={{ padding: '1rem 1.25rem', fontWeight: 700, textAlign: 'right', color: 'var(--color-text-secondary)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, idx) => {
                  const itemCount = cat.items?.length || 0;
                  return (
                    <tr 
                      key={cat.id} 
                      style={{ 
                        borderBottom: idx !== categories.length - 1 ? '1px solid var(--color-border-subtle)' : 'none',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '1.1rem 1.25rem', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>{cat.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1.1rem 1rem', fontFamily: 'monospace', color: '#6366f1', fontSize: '0.85rem' }}>
                        {cat.slug}
                      </td>
                      <td style={{ padding: '1.1rem 1rem', color: 'var(--color-text-secondary)' }}>
                        {cat.noun || `a ${cat.name.toLowerCase()}`}
                      </td>
                      <td style={{ padding: '1.1rem 1rem', fontWeight: 700, color: '#16a34a' }}>
                        ₹{cat.base_price ?? 0}
                      </td>
                      <td style={{ padding: '1.1rem 1rem' }}>
                        <span style={{ 
                          backgroundColor: '#f1f5f9', 
                          padding: '3px 8px', 
                          borderRadius: '12px', 
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          color: '#475569'
                        }}>
                          {itemCount} {itemCount === 1 ? 'issue' : 'issues'}
                        </span>
                      </td>
                      <td style={{ padding: '1.1rem 1rem' }}>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(cat)}
                          title="Click to toggle status"
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            border: 'none',
                            backgroundColor: cat.is_active ? '#dcfce7' : '#fee2e2',
                            color: cat.is_active ? '#15803d' : '#b91c1c'
                          }}
                        >
                          {cat.is_active ? '● Active' : '○ Inactive'}
                        </button>
                      </td>
                      <td style={{ padding: '1.1rem 1.25rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => openEditModal(cat)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#eff6ff',
                              color: '#1d4ed8',
                              border: '1px solid #bfdbfe',
                              borderRadius: '6px',
                              fontWeight: 600,
                              fontSize: '0.825rem',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            style={{
                              padding: '6px 10px',
                              backgroundColor: '#fff',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              fontWeight: 600,
                              fontSize: '0.825rem',
                              cursor: 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over / Modal for Create & Edit */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '780px',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#fafbfc'
            }}>
              <div>
                <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: 'var(--color-primary)' }}>
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Category'}
                </h2>
                <p style={{ margin: '3px 0 0 0', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  Configure base details, prices, and sub-service booking questions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.4rem',
                  cursor: 'pointer',
                  color: '#64748b'
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
              <div style={{ padding: '1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', flex: 1 }}>
                
                {/* Basic Fields Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Plumber, House Cleaning"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        fontSize: '0.9rem'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                      URL Slug
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. plumber, cleaning"
                      value={slug}
                      onChange={e => setSlug(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontFamily: 'monospace'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                      Specialist Noun (Booking Header)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. a plumber, a house cleaner"
                      value={noun}
                      onChange={e => setNoun(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        fontSize: '0.9rem'
                      }}
                    />
                    <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                      Displayed as: &quot;Booking {noun || 'a specialist'}. Change service&quot;
                    </small>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                      Base Starting Price (₹)
                    </label>
                    <input
                      type="number"
                      min={0}
                      required
                      placeholder="599"
                      value={basePrice}
                      onChange={e => setBasePrice(Number(e.target.value))}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        border: '1px solid var(--color-border)',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: 700
                      }}
                    />
                    <small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>
                      Starting price before extra option additions.
                    </small>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '4px' }}>
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description for category"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      border: '1px solid var(--color-border)',
                      borderRadius: '6px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="cat_active"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="cat_active" style={{ fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
                    Active & Available for Booking on Website
                  </label>
                </div>

                {/* Sub-services / Issues Section */}
                <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700 }}>
                        Sub-services / What Needs Fixing? ({items.length})
                      </h3>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                        These appear in Step 1 of the booking flow as selectable options.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      style={{
                        padding: '6px 14px',
                        backgroundColor: '#f0fdf4',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        cursor: 'pointer'
                      }}
                    >
                      + Add Option
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {items.map((it, idx) => {
                      const finalItemPrice = (Number(basePrice) || 0) + (Number(it.add) || 0);
                      return (
                        <div 
                          key={idx}
                          style={{
                            padding: '12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            backgroundColor: '#fafbfc',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                        >
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', width: '22px' }}>
                              #{idx + 1}
                            </span>
                            <input
                              type="text"
                              placeholder="Title (e.g. Leaking tap or pipe)"
                              required
                              value={it.name}
                              onChange={e => handleUpdateItem(idx, 'name', e.target.value)}
                              style={{
                                flex: 2,
                                padding: '6px 10px',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                fontSize: '0.875rem',
                                fontWeight: 600
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Time (e.g. 1–2 hrs)"
                              value={it.time || ''}
                              onChange={e => handleUpdateItem(idx, 'time', e.target.value)}
                              style={{
                                width: '110px',
                                padding: '6px 10px',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                fontSize: '0.875rem'
                              }}
                            />
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>+₹</span>
                              <input
                                type="number"
                                placeholder="Extra ₹"
                                value={it.add ?? 0}
                                onChange={e => handleUpdateItem(idx, 'add', Number(e.target.value))}
                                style={{
                                  width: '80px',
                                  padding: '6px 8px',
                                  border: '1px solid var(--color-border)',
                                  borderRadius: '4px',
                                  fontSize: '0.875rem',
                                  fontWeight: 600
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '0.825rem', fontWeight: 700, color: '#16a34a', minWidth: '70px', textAlign: 'right' }}>
                              ₹{finalItemPrice}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              title="Delete this option"
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontSize: '1rem',
                                padding: '0 6px'
                              }}
                            >
                              🗑️
                            </button>
                          </div>

                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: '32px' }}>
                            <input
                              type="text"
                              placeholder="Description (e.g. Washbasin, sink, shower or exposed pipe leak)"
                              value={it.desc || ''}
                              onChange={e => handleUpdateItem(idx, 'desc', e.target.value)}
                              style={{
                                flex: 1,
                                padding: '6px 10px',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                fontSize: '0.825rem',
                                color: 'var(--color-text-secondary)'
                              }}
                            />
                            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', cursor: 'pointer', color: '#b91c1c', fontWeight: 600 }}>
                              <input
                                type="checkbox"
                                checked={Boolean(it.em)}
                                onChange={e => handleUpdateItem(idx, 'em', e.target.checked)}
                              />
                              Emergency Task
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div style={{
                padding: '1.25rem 1.75rem',
                borderTop: '1px solid var(--color-border)',
                backgroundColor: '#fafbfc',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px'
              }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#fff',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <Button type="submit" variant="primary" isLoading={saving}>
                  {editingCategory ? 'Save Changes' : 'Create Category'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
