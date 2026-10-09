import { fetchApi } from './client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active: boolean;
  parent_id?: string;
  created_at: string;
}

export async function getCategories(): Promise<{ items: Category[] }> {
  return fetchApi('/categories');
}

export async function getCategoryBySlug(slug: string): Promise<Category> {
  return fetchApi(`/categories/slug/${slug}`); // Or whatever the endpoint is
}
