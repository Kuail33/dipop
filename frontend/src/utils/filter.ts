import { ListingItem, SortOption } from '../types';

export function isValidFandmEmail(email: string): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  return /^[a-zA-Z0-9._%+-]+@fandm\.edu$/.test(trimmed);
}

// Demo login is restricted to exactly these two fake accounts.
export const ALLOWED_LOGIN_EMAILS = ['student@fandm.edu', 'staff@fandm.edu'];

export function isValidLoginEmail(email: string): boolean {
  if (!email) return false;
  return ALLOWED_LOGIN_EMAILS.includes(email.trim().toLowerCase());
}

export function extractInitials(nameOrEmail: string): string {
  if (!nameOrEmail) return 'FM';
  const clean = nameOrEmail.split('@')[0].trim();
  const parts = clean.split(/[.\s_-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (clean.length >= 2) {
    return clean.slice(0, 2).toUpperCase();
  }
  return clean.toUpperCase() || 'FM';
}

export function formatPrice(price: number): string {
  if (price === 0) return 'Free';
  return `$${price}`;
}

export function buildMetaLine(item: {
  size?: string;
  brand?: string;
  condition: string;
}): string {
  const parts: string[] = [];
  if (item.size && item.size.trim()) parts.push(item.size.trim());
  if (item.brand && item.brand.trim()) parts.push(item.brand.trim());
  if (item.condition && item.condition.trim()) parts.push(item.condition.trim());
  return parts.join(' • ');
}

export function filterAndSortListings(
  items: ListingItem[],
  options: {
    sort: SortOption;
    minPrice?: number;
    maxPrice?: number;
    searchQuery?: string;
    nowDate?: Date;
    includeSold?: boolean;
    category?: 'marketplace' | 'gatr';
  }
): ListingItem[] {
  const now = options.nowDate ? options.nowDate.getTime() : Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  return items
    .filter((item) => {
      // Category filter
      if (options.category && item.category !== options.category) {
        return false;
      }

      // Public status filter
      if (!options.includeSold && item.status !== 'available') {
        return false;
      }

      // Price filter (0 is free)
      if (options.minPrice !== undefined && item.price < options.minPrice) {
        return false;
      }
      if (options.maxPrice !== undefined && item.price > options.maxPrice) {
        return false;
      }

      // Search query
      if (options.searchQuery && options.searchQuery.trim()) {
        const q = options.searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesBrand = item.brand?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        if (!matchesName && !matchesBrand && !matchesDesc) return false;
      }

      // Date range filtering
      const itemTime = new Date(item.createdAt).getTime();
      const ageMs = now - itemTime;

      switch (options.sort) {
        case 'past_week':
          return ageMs <= 7 * ONE_DAY;
        case 'past_month':
          return ageMs <= 30 * ONE_DAY;
        case 'past_3_months':
          return ageMs <= 90 * ONE_DAY;
        case 'past_6_months':
          return ageMs <= 180 * ONE_DAY;
        case 'past_12_months':
          return ageMs <= 365 * ONE_DAY;
        case 'newest':
        default:
          return true;
      }
    })
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return timeB - timeA;
    });
}
