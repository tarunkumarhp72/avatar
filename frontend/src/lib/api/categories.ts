import { fetchApi } from './client';

export interface CategoryIssue {
  id: string;
  name: string;
  desc?: string;
  time?: string;
  add?: number;
  em?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  noun?: string;
  base_price?: number;
  items?: CategoryIssue[];
  icon_url?: string;
  icon?: string;
  is_active: boolean;
  sort_order?: number;
  parent_id?: string;
  pricing_model?: string;
}

export async function getCategories(): Promise<Category[]> {
  return fetchApi('/categories');
}

export async function getCategoryBySlug(idOrSlug: string): Promise<Category> {
  return fetchApi(`/categories/${idOrSlug}`);
}

export async function getAdminCategories(): Promise<Category[]> {
  return fetchApi('/admin/categories');
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  return fetchApi('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category> {
  return fetchApi(`/admin/categories/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  return fetchApi(`/admin/categories/${id}`, {
    method: 'DELETE',
  });
}

