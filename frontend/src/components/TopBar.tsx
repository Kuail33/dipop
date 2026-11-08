import React from 'react';
import { TabType } from '../types';
import { LogoPlaceholder } from './LogoPlaceholder';
import { MaterialIcon } from './MaterialIcon';
import { extractInitials } from '../utils/filter';
import { RolePill } from './RolePill';

interface TopBarProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  savedCount: number;
  userEmail: string;
  userDips: number;
  onOpenRewards: () => void;
  isFaculty: boolean;
  onSwitchRole: () => void;
  onSignOut: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  onTabChange,
  savedCount,
  userEmail,
  userDips,
  onOpenRewards,
  isFaculty,
  onSwitchRole,
  onSignOut,
}) => {
  const userInitials = extractInitials(userEmail);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#E1E6EF] select-none">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 h-14 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Left: Brand logo slot */}
        <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
          <button
            onClick={() => onTabChange('marketplace')}
            className="flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer p-0.5 rounded focus:outline-none -ml-7 sm:-ml-9 translate-y-1"
            aria-label="dipop Home - Return to Marketplace"
          >
            <LogoPlaceholder variant="xxlarge" />
          </button>
        </div>

        {/* Center: Section tabs with responsive labels */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1" aria-label="Main navigation">
          <button
            onClick={() => onTabChange('marketplace')}
            className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-[0.75rem] transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-1 shrink-0 ${
              currentTab === 'marketplace'
                ? 'bg-[#003DA5] text-white'
                : 'text-[#041E42] hover:bg-[#F1F4F9]'
            }`}
            aria-current={currentTab === 'marketplace' ? 'page' : undefined}
          >
            <MaterialIcon name="storefront" size={17} />
            <span className="hidden xs:inline sm:inline">Marketplace</span>
            <span className="inline xs:hidden sm:hidden">Shop</span>
          </button>

          <button
            onClick={() => onTabChange('food_corner')}
            className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-[0.75rem] transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-1 shrink-0 ${
              currentTab === 'food_corner'
                ? 'bg-[#003DA5] text-white'
                : 'text-[#041E42] hover:bg-[#F1F4F9]'
            }`}
            aria-current={currentTab === 'food_corner' ? 'page' : undefined}
          >
            <MaterialIcon name="restaurant" size={17} />
            <span className="hidden xs:inline sm:inline">Food Corner</span>
            <span className="inline xs:hidden sm:hidden">Food</span>
          </button>

          <button
            onClick={() => onTabChange('give_and_take')}
            className={`px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-[0.75rem] transition-all duration-150 active:scale-95 cursor-pointer flex items-center gap-1 shrink-0 ${
              currentTab === 'give_and_take'
                ? 'bg-[#003DA5] text-white'
                : 'text-[#041E42] hover:bg-[#F1F4F9]'
            }`}
            aria-current={currentTab === 'give_and_take' ? 'page' : undefined}
          >
            <MaterialIcon name="volunteer_activism" size={17} />
            <span className="hidden xs:inline sm:inline">Give and Take Room</span>
            <span className="inline xs:hidden sm:hidden">GATR</span>
          </button>
        </nav>

        {/* Right side controls: Saves, Profile, Role badge */}
        <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
          {/* Role status pill / switcher */}
          <RolePill isFaculty={isFaculty} onSwitchRole={onSwitchRole} />

          {/* Saves heart button */}
          <button
            onClick={() => onTabChange('saves')}
            className="group relative inline-flex items-center justify-center p-1.5 sm:p-2 rounded-full transition-colors cursor-pointer text-[#041E42] hover:bg-[#003DA5] hover:text-white"
            aria-label={`Saved items (${savedCount} saved)`}
            title="Saved items"
          >
            <MaterialIcon name="favorite" size={19} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center bg-[#003DA5] text-white group-hover:bg-white group-hover:text-[#003DA5]">
                {savedCount}
              </span>
            )}
          </button>

          {/* Profile button */}
          <button
            onClick={() => onTabChange('profile')}
            className={`flex items-center gap-1.5 p-0.5 rounded-full transition-all cursor-pointer ${
              currentTab === 'profile'
                ? 'ring-2 ring-[#003DA5]'
                : 'hover:opacity-85'
            }`}
            aria-label={`User profile for ${userEmail}`}
            title="Profile & listings"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#041E42] text-white font-bold text-xs flex items-center justify-center">
              {userInitials}
            </div>
          </button>

          {/* Sign out */}
          <button
            onClick={onSignOut}
            className="p-1 text-[#6B7280] hover:text-[#041E42] rounded hover:bg-[#F1F4F9] transition-colors cursor-pointer hidden sm:flex"
            aria-label="Sign out"
            title="Sign out"
          >
            <MaterialIcon name="logout" size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};
