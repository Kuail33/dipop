import React, { useState } from 'react';
import { MaterialIcon } from './MaterialIcon';
import { isValidFandmEmail } from '../utils/filter';

interface RewardDiplomatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAward: (donorEmail: string, amount: number, note?: string) => void;
}

export const RewardDiplomatModal: React.FC<RewardDiplomatModalProps> = ({
  isOpen,
  onClose,
  onAward,
}) => {
  const [donorEmail, setDonorEmail] = useState('');
  const [dipsAmount, setDipsAmount] = useState(10);
  const [donationNote, setDonationNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = donorEmail.trim();

    if (!cleanEmail || !isValidFandmEmail(cleanEmail)) {
      setError('Use your @fandm.edu email address.');
      return;
    }

    if (dipsAmount < 1) {
      setError('Award at least 1 dip point.');
      return;
    }

    setError(null);
    onAward(cleanEmail, dipsAmount, donationNote.trim() || undefined);
    setDonorEmail('');
    setDipsAmount(10);
    setDonationNote('');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#041E42]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reward-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-[14px] shadow-2xl border border-[#E1E6EF] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E1E6EF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MaterialIcon name="military_tech" size={20} className="text-[#009CDE]" />
            <h2 id="reward-modal-title" className="text-base font-bold text-[#041E42]">
              Reward a Diplomat
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* One line of context */}
          <p className="text-xs text-[#6B7280]">
            Credit Dipomine to a donor who dropped an item at the Give and Take Room.
          </p>

          {/* Field one: Donor email */}
          <div>
            <label htmlFor="donor-email" className="block text-xs font-bold text-[#041E42] uppercase tracking-wider mb-1.5">
              Donor Email (Required)
            </label>
            <input
              id="donor-email"
              type="email"
              value={donorEmail}
              onChange={(e) => {
                setDonorEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="donor@fandm.edu"
              className={`w-full px-3.5 py-2.5 bg-[#F1F4F9] border ${
                error ? 'border-red-500 ring-1 ring-red-500' : 'border-[#E1E6EF]'
              } rounded-[0.75rem] text-sm text-[#041E42] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#003DA5]`}
              autoFocus
            />
            {error && (
              <p className="text-xs text-red-600 mt-1.5 font-medium flex items-center gap-1" role="alert">
                <MaterialIcon name="error" size={14} className="text-red-600" />
                <span>{error}</span>
              </p>
            )}
          </div>

          {/* Field two: Dipomine to award with stepper, default +5 */}
          <div>
            <label className="block text-xs font-bold text-[#041E42] uppercase tracking-wider mb-1.5">
              Dipomine to Award
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[#E1E6EF] rounded-lg overflow-hidden bg-[#F1F4F9]">
                <button
                  type="button"
                  onClick={() => setDipsAmount((prev) => Math.max(1, prev - 1))}
                  className="px-3 py-2 text-sm font-bold text-[#041E42] hover:bg-[#E1E6EF] cursor-pointer"
                  aria-label="Decrease Dipomine to award"
                >
                  -
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={dipsAmount}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '') return;
                    const num = parseInt(raw, 10);
                    if (Number.isNaN(num)) return;
                    setDipsAmount(Math.max(1, Math.min(20, num)));
                  }}
                  className="w-14 px-2 py-2 text-sm font-bold text-[#003DA5] text-center bg-white focus:outline-none focus:ring-2 focus:ring-[#003DA5]"
                  aria-label="Dipomine amount to award"
                />
                <button
                  type="button"
                  onClick={() => setDipsAmount((prev) => Math.min(20, prev + 1))}
                  className="px-3 py-2 text-sm font-bold text-[#041E42] hover:bg-[#E1E6EF] cursor-pointer"
                  aria-label="Increase Dipomine to award"
                >
                  +
                </button>
              </div>

              {/* Quick presets */}
              <div className="flex items-center gap-1 text-xs">
                {[3, 5, 10].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDipsAmount((prev) => Math.min(20, prev + preset))}
                    className="px-2 py-1 rounded border text-xs font-semibold cursor-pointer bg-white text-[#041E42] border-[#E1E6EF] hover:bg-[#E1E6EF]"
                  >
                    +{preset}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-[11px] text-[#6B7280] mt-1">
              Recommended: 1 to 5 Dipomine for supplies/small items, 5 to 10 for electronics or furniture.
            </p>
          </div>

          {/* Optional field: Short what was donated note */}
          <div>
            <label htmlFor="donation-note" className="block text-xs font-bold text-[#041E42] uppercase tracking-wider mb-1.5">
              What was donated (Optional)
            </label>
            <input
              id="donation-note"
              type="text"
              value={donationNote}
              onChange={(e) => setDonationNote(e.target.value)}
              placeholder="e.g. Set of 3 binders and desk lamp"
              className="w-full px-3.5 py-2.5 bg-[#F1F4F9] border border-[#E1E6EF] rounded-[0.75rem] text-sm text-[#041E42] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#003DA5]"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-[#E1E6EF] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#041E42] hover:bg-[#F1F4F9] rounded-[0.75rem] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#003DA5] hover:bg-[#041E42] text-white text-xs font-semibold rounded-[0.75rem] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <MaterialIcon name="military_tech" size={16} />
              <span>Award Dipomine</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
