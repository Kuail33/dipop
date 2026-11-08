import React from 'react';
import { MaterialIcon } from './MaterialIcon';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  balance: number;
  onRedeem: (dipsToSpend: number, rewardLabel: string) => void;
}

interface RewardTier {
  id: string;
  icon: string;
  cost: number;
  prizes: string[];
}

const REWARD_TIERS: RewardTier[] = [
  { id: 'meal-swipe', icon: 'restaurant', cost: 30, prizes: ['1 meal swipe'] },
  { id: 'flex', icon: 'account_balance_wallet', cost: 100, prizes: ['$10 Flex'] },
  { id: 'meal-cup', icon: 'local_cafe', cost: 150, prizes: ['$10 Meal Cup'] },
  { id: 'absence', icon: 'event_busy', cost: 200, prizes: ['1 Unexpected Absence'] },
  {
    id: 'grade-boost',
    icon: 'trending_up',
    cost: 5000,
    prizes: ['Food Truck of Choice', 'Bump up ⅓ letter grade'],
  },
  { id: 'free-a-100', icon: 'school', cost: 10000, prizes: ['Free A in any 100-level class'] },
  { id: 'free-a-200', icon: 'school', cost: 100000, prizes: ['Free A in any 200-level class'] },
  { id: 'free-a-any', icon: 'workspace_premium', cost: 1000000, prizes: ['Free A in ANY level class'] },
];

export const RewardsModal: React.FC<RewardsModalProps> = ({
  isOpen,
  onClose,
  balance,
  onRedeem,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#041E42]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rewards-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-[14px] shadow-2xl border border-[#E1E6EF]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-[#E1E6EF] flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <h2 id="rewards-title" className="text-base font-bold text-[#041E42]">
              Dipomine Rewards
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#6B7280] hover:text-[#041E42] rounded-md hover:bg-[#F1F4F9] cursor-pointer"
            aria-label="Close modal"
          >
            <MaterialIcon name="close" size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Big Balance Banner */}
          <div className="bg-[#F1F4F9] border border-[#E1E6EF] rounded-[14px] p-5 text-center">
            <p className="text-xs font-bold text-[#6B7280] uppercase tracking-wider mb-1">
              Your Current Balance
            </p>
            <div className="text-3xl font-extrabold text-[#003DA5] tracking-tight">
              {balance.toLocaleString()} Dipomine
            </div>
            <p className="text-xs text-[#6B7280] mt-1">
              Earned by donating clean items to F&amp;M GATR
            </p>
          </div>

          {/* Exchange list */}
          <div className="space-y-4">
            <p className="text-xs font-bold text-[#041E42] uppercase tracking-wider">
              Exchange Options
            </p>

            {REWARD_TIERS.map((tier) => (
              <div
                key={tier.id}
                className="p-4 bg-white border border-[#E1E6EF] rounded-[0.75rem] shadow-xs space-y-0.5"
              >
                {/* Cost header, styled like the balance banner */}
                <div className="flex items-center gap-1.5">
                  <MaterialIcon name="stars" size={20} className="text-[#009CDE]" />
                  <span className="text-xl font-extrabold text-[#003DA5] tracking-tight">
                    {tier.cost.toLocaleString()} Dipomine
                  </span>
                </div>

                {/* The prize — kept in focus */}
                <div className="space-y-1.5">
                  {tier.prizes.map((prize) => (
                    <div key={prize} className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <MaterialIcon name={tier.icon} size={20} className="text-[#003DA5] shrink-0" />
                        <span className="text-base font-medium text-[#041E42] leading-snug">
                          {prize}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => onRedeem(tier.cost, prize)}
                        disabled={balance < tier.cost}
                        className="px-4 py-1.5 bg-[#003DA5] hover:bg-[#041E42] disabled:bg-[#E1E6EF] disabled:text-[#6B7280] text-white text-xs font-semibold rounded-[0.75rem] transition-colors cursor-pointer shrink-0"
                      >
                        Redeem
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-3.5 bg-[#F1F4F9] border-t border-[#E1E6EF] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-[#E1E6EF] text-[#041E42] border border-[#E1E6EF] text-xs font-semibold rounded-[0.75rem] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
