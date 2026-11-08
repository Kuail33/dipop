export type ItemCondition = 'New' | 'Like New' | 'Good' | 'Fair' | 'Poor';

export type ItemStatus = 'available' | 'sold';

export type ListingCategory = 'marketplace' | 'gatr';

export interface ListingItem {
  id: string;
  name: string;
  price: number; // 0 means free
  condition: ItemCondition;
  size?: string;
  brand?: string;
  description?: string;
  pickupLocation?: string;
  photos: string[];
  sellerName: string;
  sellerEmail: string;
  sellerInitials: string;
  createdAt: string; // ISO date string
  status: ItemStatus;
  category: ListingCategory;
}

export interface FoodItem {
  id: string;
  title: string;
  quantity: string;
  pickupLocation: string;
  hours: string;
  posterRole: string;
  posterEmail: string;
  notes?: string;
  claimedCount: number;
  totalSlots: number;
  photos?: string[];
  datePost?: string;
  brand?: string;
  allergen?: string;
}

export type SortOption =
  | 'newest'
  | 'past_week'
  | 'past_month'
  | 'past_3_months'
  | 'past_6_months'
  | 'past_12_months';

export type TabType = 'marketplace' | 'food_corner' | 'give_and_take' | 'saves' | 'profile';

export interface DipsTransaction {
  id: string;
  donorEmail: string;
  amount: number;
  itemNote?: string;
  awardedBy: string;
  createdAt: string;
  type: 'earned' | 'redeemed';
}
