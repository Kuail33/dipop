import { ListingItem, FoodItem, ListingCategory } from '../types';

const API_BASE = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:8000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}${text ? `: ${text}` : ''}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json() as Promise<T>;
}

export function fetchListings(): Promise<ListingItem[]> {
  return request('/api/listings');
}

export function fetchFood(): Promise<FoodItem[]> {
  return request('/api/food');
}

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`${API_BASE}/api/upload`, { method: 'POST', body: form });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Upload failed: ${res.status}${text ? `: ${text}` : ''}`);
  }
  const data = (await res.json()) as { url: string };
  return data.url;
}

export type CreateListingBody = Omit<ListingItem, 'id' | 'createdAt' | 'status' | 'sellerInitials'> & {
  category: ListingCategory;
};

export function createListing(body: CreateListingBody): Promise<ListingItem> {
  return request('/api/listings', { method: 'POST', body: JSON.stringify(body) });
}

export function setListingStatus(
  category: ListingCategory,
  id: string,
  status: 'available' | 'sold',
  requesterEmail: string
): Promise<{ ok: boolean; id: string; status: string }> {
  return request(`/api/listings/${category}/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, requesterEmail }),
  });
}

export type EditListingBody = Partial<
  Omit<ListingItem, 'id' | 'createdAt' | 'status' | 'category' | 'sellerName' | 'sellerEmail' | 'sellerInitials'>
>;

export function editListing(
  category: ListingCategory,
  id: string,
  body: EditListingBody,
  requesterEmail: string
): Promise<ListingItem> {
  return request(`/api/listings/${category}/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ ...body, requesterEmail }),
  });
}

export function deleteListing(
  category: ListingCategory,
  id: string,
  requesterEmail: string
): Promise<{ ok: boolean; id: string }> {
  return request(
    `/api/listings/${category}/${id}?requesterEmail=${encodeURIComponent(requesterEmail)}`,
    { method: 'DELETE' }
  );
}
