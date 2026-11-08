import React, { useState, useRef, useEffect } from 'react';
import { MaterialIcon } from './MaterialIcon';

interface DipsPillProps {
  dips: number;
  onOpenRewards: () => void;
  className?: string;
}

export const DipsPill: React.FC<DipsPillProps> = ({
  dips,
  onOpenRewards,
  className = '',
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverOpen(false);
      }
    }
    if (popoverOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverOpen]);

  const handleMouseEnter = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowTooltip(false);
  };

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={popoverRef}>
      {/* Quiet token pill: soft Lux Blue or pale blue fill, not a primary CTA button */}
      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#009CDE]/12 border border-[#009CDE]/30 text-[#003DA5] select-none text-xs font-semibold">
        <MaterialIcon name="stars" size={14} className="text-[#009CDE]" />
        <span>{dips} Dipomine</span>

        {/* Superscript (i) info marker */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowTooltip(false);
            setPopoverOpen((prev) => !prev);
          }}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative ml-0.5 w-4 h-4 rounded-full bg-[#009CDE]/20 hover:bg-[#009CDE]/30 text-[#003DA5] text-[10px] font-bold flex items-center justify-center cursor-pointer transition-colors focus:outline-none focus:ring-1 focus:ring-[#003DA5]"
          aria-label="How Dipomine works"
          title="Dipomine explain"
        >
          i
        </button>
      </div>

      {/* Hover tooltip saying "Dipomine explain" */}
      {showTooltip && !popoverOpen && (
        <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#041E42] text-white text-[10px] font-medium rounded shadow-md whitespace-nowrap pointer-events-none z-30 animate-in fade-in duration-150">
          Dipomine explain
        </div>
      )}

      {/* Popover anchored to the pill */}
      {popoverOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white border border-[#E1E6EF] rounded-[14px] shadow-xl p-4 z-40 text-left animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-[#E1E6EF] text-sm font-bold text-[#041E42]">
            <MaterialIcon name="stars" size={16} className="text-[#009CDE]" />
            <span>Dipomine Rewards</span>
          </div>

          {/* Three short lines in plain campus voice */}
          <div className="space-y-2.5 text-xs text-[#041E42]">
            <div>
              <p className="font-bold text-xs text-[#009CDE] tracking-wider mb-0.5">
                What is Dipomine
              </p>
              <p className="leading-relaxed">
                Dipomine is dipop's reward currency for giving things away on campus.
              </p>
            </div>

            <div>
              <p className="font-bold text-xs text-[#009CDE] tracking-wider mb-0.5">
                What Dipomine does
              </p>
              <p className="leading-relaxed text-[#041E42]">
                1 Dipomine = 0.75 bookstore credits ($), and 10 Dipomine = 2 meal swipes.
              </p>
            </div>

            <div>
              <p className="font-bold text-xs text-[#009CDE] tracking-wider mb-0.5">
                I want Dipomine
              </p>
              <p className="leading-relaxed">
                Donate an item to the Give and Take Room and the staff there will credit you with Dipomine depending on your drop off items.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
