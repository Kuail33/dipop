import React from 'react';
import { ListingItem } from '../types';
import { ListingCard } from './ListingCard';
import { MaterialIcon } from './MaterialIcon';

interface GiveAndTakeViewProps {
  gatrItems: ListingItem[];
  onSelectItem: (item: ListingItem) => void;
  onOpenDonateGuide: () => void;
}

export const GiveAndTakeView: React.FC<GiveAndTakeViewProps> = ({
  gatrItems,
  onSelectItem,
  onOpenDonateGuide,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E1E6EF] mb-6">
        <div>
          <h1 className="text-[2rem] font-bold text-[#041E42] tracking-tight">
            Give and Take Room (GATR)
          </h1>
          <p className="text-sm text-[#6B7280] font-medium mt-0.5">
            Donate to keep free stuff to come
          </p>
        </div>

        <button
          onClick={onOpenDonateGuide}
          className="px-4 py-2 bg-white hover:bg-[#F1F4F9] text-[#003DA5] border border-[#003DA5] text-xs font-semibold rounded-[0.75rem] transition-colors flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <MaterialIcon name="info" size={16} />
          <span>How GATR works</span>
        </button>
      </div>

      {/* Info notice explaining gallery nature */}
      <div className="mb-6 p-3.5 bg-[#F1F4F9] border border-[#E1E6EF] rounded-[14px] flex items-center gap-3 text-xs text-[#041E42]">
        <MaterialIcon name="volunteer_activism" size={18} className="text-[#003DA5] shrink-0" />
        <span>
          Community donation gallery. Items below are free to grab directly from designated campus shelves
        </span>
      </div>

      {/* 4 columns on desktop, 2 on mobile, tight 6-8px gaps */}
      {gatrItems.length === 0 ? (
        <div className="py-16 text-center text-[#6B7280] bg-[#F1F4F9] rounded-[14px] border border-[#E1E6EF]">
          <MaterialIcon name="volunteer_activism" size={36} className="text-[#6B7280]/60 mb-2" />
          <p className="text-sm font-semibold text-[#041E42]">No donated items on the shelves right now.</p>
          <p className="text-xs text-[#6B7280] mt-1">Check back soon or donate an unused item from your profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
          {gatrItems.map((item) => (
            <ListingCard
              key={item.id}
              item={item}
              isSaved={false}
              onToggleSave={() => {}}
              onClick={onSelectItem}
              hideHeart
              forceFree
              showHoverDetails
              disableClick
            />
          ))}
        </div>
      )}
    </div>
  );
};
