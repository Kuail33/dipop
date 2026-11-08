import React, { useState } from 'react';
import { ListingItem } from '../types';
import { ListingCard } from './ListingCard';
import { MaterialIcon } from './MaterialIcon';
import { extractInitials } from '../utils/filter';
import { DipsPill } from './DipsPill';

interface ProfileViewProps {
  userEmail: string;
  userDips: number;
  isFaculty: boolean;
  myListings: ListingItem[];
  savedListings: ListingItem[];
  savedIds: string[];
  onToggleSave: (e: React.MouseEvent, id: string) => void;
  onSelectItem: (item: ListingItem) => void;
  onOpenSellModal: () => void;
  onOpenGATRGuide: () => void;
  onOpenRewards: () => void;
  onOpenRewardDiplomats?: () => void;
  onEditItem: (item: ListingItem) => void;
  onToggleStatus: (item: ListingItem) => void;
  onDeleteItem: (id: string) => void;
  initialTab?: 'selling' | 'saves';
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userEmail,
  userDips,
  isFaculty,
  myListings,
  savedListings,
  savedIds,
  onToggleSave,
  onSelectItem,
  onOpenSellModal,
  onOpenGATRGuide,
  onOpenRewards,
  onOpenRewardDiplomats,
  onEditItem,
  onToggleStatus,
  onDeleteItem,
  initialTab = 'selling',
}) => {
  const [activeTab, setActiveTab] = useState<'selling' | 'saves'>(initialTab);

  const activeItems = myListings.filter((i) => i.status === 'available');
  const soldItems = myListings.filter((i) => i.status === 'sold');

  const initials = extractInitials(userEmail);
  const userName = userEmail.split('@')[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Profile Header without dividing line above tabs */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-4 mb-2">
        {/* User Identity info */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#041E42] text-white font-bold text-xl flex items-center justify-center shadow-xs shrink-0">
            {initials}
          </div>
          <div>
            {/* Header: name plus dips pill plus info marker */}
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-[#041E42] leading-tight">
                {userName}
              </h1>
              <span className="text-[#6B7280] font-light">•</span>
              <DipsPill dips={userDips} onOpenRewards={onOpenRewards} />
            </div>

            <p className="text-xs text-[#6B7280] font-medium mt-0.5">{userEmail}</p>

            {/* Existing stat line stays on row below, unchanged */}
            <p className="text-xs text-[#041E42] font-semibold mt-1">
              {activeItems.length} selling, {soldItems.length} sold
            </p>
          </div>
        </div>

        {/* Action buttons stacked top-right */}
        <div className="flex flex-col gap-2 w-full sm:w-auto">
          <button
            onClick={onOpenSellModal}
            className="w-full sm:w-48 py-2.5 px-4 bg-[#003DA5] hover:bg-[#041E42] text-white text-xs font-semibold rounded-[0.75rem] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <MaterialIcon name="add" size={16} />
            <span>Sell on Bulletin</span>
          </button>

          <button
            onClick={onOpenGATRGuide}
            className="w-full sm:w-48 py-2.5 px-4 bg-[#F1F4F9] hover:bg-[#E1E6EF] text-[#041E42] border border-[#E1E6EF] text-xs font-semibold rounded-[0.75rem] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MaterialIcon name="volunteer_activism" size={16} />
            <span>Donate to GATR</span>
          </button>

          {/* Faculty privileged action: Reward Diplomats */}
          {isFaculty && onOpenRewardDiplomats && (
            <button
              onClick={onOpenRewardDiplomats}
              className="w-full sm:w-48 py-2.5 px-4 bg-[#009CDE]/12 hover:bg-[#009CDE]/20 text-[#003DA5] border border-[#009CDE]/30 text-xs font-semibold rounded-[0.75rem] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              title="Award Dipomine to F&M students donating to GATR"
            >
              <MaterialIcon name="military_tech" size={16} className="text-[#041E42]" />
              <span>Reward Diplomats</span>
            </button>
          )}

          {/* Student-only action: Redeem Dips */}
          {!isFaculty && (
            <button
              onClick={onOpenRewards}
              className="w-full sm:w-48 py-2.5 px-4 bg-[#009CDE]/12 hover:bg-[#009CDE]/20 text-[#003DA5] border border-[#009CDE]/30 text-xs font-semibold rounded-[0.75rem] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              title="Redeem Dipomine for bookstore credit or meal swipes"
            >
              <MaterialIcon name="redeem" size={16} className="text-[#041E42]" />
              <span>Redeem Dipomine</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs: Selling and Saves (no line above buttons) */}
      <div className="flex items-center gap-3 border-b border-[#E1E6EF] mb-6 pt-2">
        <button
          onClick={() => setActiveTab('selling')}
          className={`pb-3 text-sm font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'selling'
              ? 'border-[#003DA5] text-[#003DA5]'
              : 'border-transparent text-[#6B7280] hover:text-[#041E42]'
          }`}
        >
          <MaterialIcon name="sell" size={18} />
          <span>Selling ({myListings.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saves')}
          className={`pb-3 text-sm font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
            activeTab === 'saves'
              ? 'border-[#003DA5] text-[#003DA5]'
              : 'border-transparent text-[#6B7280] hover:text-[#041E42]'
          }`}
        >
          <MaterialIcon name="favorite" filled={activeTab === 'saves'} size={18} />
          <span>Saves ({savedListings.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'selling' ? (
        <div className="space-y-10">
          {/* Active section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#041E42]">
                Active ({activeItems.length})
              </h2>
              <span className="text-xs text-[#6B7280]">
                Visible on public marketplace
              </span>
            </div>

            {activeItems.length === 0 ? (
              <div className="py-10 text-center bg-[#F1F4F9] rounded-[14px] border border-[#E1E6EF] p-6">
                <MaterialIcon name="storefront" size={32} className="text-[#6B7280]/60 mb-2" />
                <p className="text-sm font-semibold text-[#041E42]">No active listings.</p>
                <p className="text-xs text-[#6B7280] mt-1 mb-4">Post something from your dorm or closet to start selling.</p>
                <button
                  onClick={onOpenSellModal}
                  className="px-4 py-2 bg-[#003DA5] hover:bg-[#041E42] text-white text-xs font-semibold rounded-[0.75rem] transition-colors cursor-pointer"
                >
                  Create listing
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
                {activeItems.map((item) => (
                  <ListingCard
                    key={item.id}
                    item={item}
                    isSaved={savedIds.includes(item.id)}
                    onToggleSave={onToggleSave}
                    onClick={onSelectItem}
                    showOwnerMenu
                    onEdit={onEditItem}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDeleteItem}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Sold section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-[#041E42]">
                Sold ({soldItems.length})
              </h2>
              <span className="text-xs text-[#6B7280]">
                Filtered out of public grid
              </span>
            </div>

            {soldItems.length === 0 ? (
              <div className="py-8 text-center text-[#6B7280] text-xs">
                No completed sales yet. When you mark an item sold, it will move here.
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
                {soldItems.map((item) => (
                  <ListingCard
                    key={item.id}
                    item={item}
                    isSaved={savedIds.includes(item.id)}
                    onToggleSave={onToggleSave}
                    onClick={onSelectItem}
                    showOwnerMenu
                    onEdit={onEditItem}
                    onToggleStatus={onToggleStatus}
                    onDelete={onDeleteItem}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Saves Tab */
        <div>
          {savedListings.length === 0 ? (
            <div className="py-16 text-center bg-[#F1F4F9] rounded-[14px] border border-[#E1E6EF] p-6">
              <MaterialIcon name="favorite_border" size={36} className="text-[#6B7280]/60 mb-2" />
              <p className="text-sm font-semibold text-[#041E42]">Nothing listed yet in your saves.</p>
              <p className="text-xs text-[#6B7280] mt-1">Tap the heart on any item in Marketplace to save it here for later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
              {savedListings.map((item) => (
                <ListingCard
                  key={item.id}
                  item={item}
                  isSaved={true}
                  onToggleSave={onToggleSave}
                  onClick={onSelectItem}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
