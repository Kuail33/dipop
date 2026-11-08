import React from 'react';
import { ListingItem, SortOption } from '../types';
import { ListingCard } from './ListingCard';
import { SkeletonGrid } from './SkeletonGrid';
import { MaterialIcon } from './MaterialIcon';

interface MarketplaceViewProps {
  items: ListingItem[];
  isLoading: boolean;
  savedIds: string[];
  onToggleSave: (e: React.MouseEvent, id: string) => void;
  onSelectItem: (item: ListingItem) => void;
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  minPrice: number;
  maxPrice: number;
  onMinPriceChange: (val: number) => void;
  onMaxPriceChange: (val: number) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  items,
  isLoading,
  savedIds,
  onToggleSave,
  onSelectItem,
  sort,
  onSortChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  searchQuery,
  onSearchChange,
  onClearFilters,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-5">
      {/* Top Header & Controls */}
      <div className="flex flex-col gap-3 pb-4 border-b border-[#E1E6EF] mb-4 sm:mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-[1.85rem] sm:text-[2rem] font-bold text-[#041E42] tracking-tight leading-none">
              Marketplace
            </h1>
            <p className="text-xs text-[#6B7280] font-medium mt-1">
              {items.length} {items.length === 1 ? 'item' : 'items'} available
            </p>
          </div>

          {/* Quick search input */}
          <div className="relative w-full sm:w-64">
            <span className="absolute left-3 top-2.5 text-[#6B7280]">
              <MaterialIcon name="search" size={17} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search items, brands, dorms..."
              className="w-full pl-9 pr-3 py-2 bg-[#F1F4F9] border border-[#E1E6EF] rounded-[0.75rem] text-xs text-[#041E42] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#003DA5]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-2.5 text-[#6B7280] hover:text-[#041E42] cursor-pointer"
                aria-label="Clear search"
              >
                <MaterialIcon name="close" size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Filter bar: Sort select, Price filter slider and inputs */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center justify-between gap-2.5 bg-[#F1F4F9] p-2.5 sm:p-3 rounded-[0.75rem] border border-[#E1E6EF]">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Sort Select */}
            <div className="flex items-center gap-1.5">
              <label htmlFor="sort-select" className="text-xs font-semibold text-[#041E42] whitespace-nowrap">
                Sort:
              </label>
              <select
                id="sort-select"
                value={sort}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="bg-white border border-[#E1E6EF] rounded-md px-2 py-1 text-xs text-[#041E42] font-medium focus:outline-none focus:ring-2 focus:ring-[#003DA5] cursor-pointer"
              >
                <option value="newest">Newest first</option>
                <option value="past_week">Past week</option>
                <option value="past_month">Past month</option>
                <option value="past_3_months">Past 3 months</option>
                <option value="past_6_months">Past 6 months</option>
                <option value="past_12_months">Past 12 months</option>
              </select>
            </div>

            {/* Price filter inputs */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-[#041E42] whitespace-nowrap">
                Price:
              </span>
              <div className="flex items-center gap-1">
                <div className="relative w-14 sm:w-16">
                  <span className="absolute left-1.5 top-1 text-[10px] text-[#6B7280]">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={minPrice === 0 ? '' : minPrice}
                    onChange={(e) => onMinPriceChange(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full pl-4 pr-1 py-1 bg-white border border-[#E1E6EF] rounded text-xs text-[#041E42] focus:outline-none focus:ring-1 focus:ring-[#003DA5]"
                    aria-label="Minimum price"
                  />
                </div>
                <span className="text-xs text-[#6B7280]">to</span>
                <div className="relative w-14 sm:w-16">
                  <span className="absolute left-1.5 top-1 text-[10px] text-[#6B7280]">$</span>
                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={maxPrice === 1000 ? '' : maxPrice}
                    onChange={(e) => onMaxPriceChange(Math.max(0, Number(e.target.value) || 1000))}
                    className="w-full pl-4 pr-1 py-1 bg-white border border-[#E1E6EF] rounded text-xs text-[#041E42] focus:outline-none focus:ring-1 focus:ring-[#003DA5]"
                    aria-label="Maximum price"
                  />
                </div>
              </div>
            </div>

            {/* Quick Free chip (0 is free) */}
            <button
              type="button"
              onClick={() => {
                if (minPrice === 0 && maxPrice === 0) {
                  onMinPriceChange(0);
                  onMaxPriceChange(1000);
                } else {
                  onMinPriceChange(0);
                  onMaxPriceChange(0);
                }
              }}
              className={`text-xs px-2 py-1 rounded-md border cursor-pointer transition-colors ${
                minPrice === 0 && maxPrice === 0
                  ? 'bg-[#003DA5] text-white border-[#003DA5]'
                  : 'bg-white text-[#041E42] border-[#E1E6EF] hover:bg-[#E1E6EF]'
              }`}
            >
              Free ($0)
            </button>
          </div>

          {(minPrice > 0 || maxPrice < 1000 || searchQuery || sort !== 'newest') && (
            <button
              onClick={onClearFilters}
              className="text-xs text-[#003DA5] hover:text-[#041E42] font-semibold cursor-pointer underline underline-offset-2 self-end sm:self-auto"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <SkeletonGrid count={8} />
      ) : items.length === 0 ? (
        <div className="py-20 text-center bg-[#F1F4F9] rounded-[14px] border border-[#E1E6EF] px-4">
          <MaterialIcon name="search_off" size={40} className="text-[#6B7280]/60 mb-2" />
          <p className="text-base font-bold text-[#041E42]">Nothing listed yet.</p>
          <p className="text-xs text-[#6B7280] mt-1 mb-4">Post something from your profile or adjust your filters.</p>
          <button
            onClick={onClearFilters}
            className="px-4 py-2 bg-[#003DA5] hover:bg-[#041E42] text-white text-xs font-semibold rounded-[0.75rem] transition-colors cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        /* Dense wall of images: 4 columns on desktop, 2 on mobile.
           Tight gaps (6px to 8px), side gutter (about 16px).
        */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
          {items.map((item) => (
            <ListingCard
              key={item.id}
              item={item}
              isSaved={savedIds.includes(item.id)}
              onToggleSave={onToggleSave}
              onClick={onSelectItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};
