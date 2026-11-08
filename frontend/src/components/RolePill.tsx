import React, { useState, useRef, useEffect } from 'react';
import { MaterialIcon } from './MaterialIcon';

interface RolePillProps {
  isFaculty: boolean;
  onSwitchRole: () => void;
  className?: string;
}

export const RolePill: React.FC<RolePillProps> = ({
  isFaculty,
  onSwitchRole,
  className = '',
}) => {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

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

  const handlePillClick = () => {
    if (isFaculty) {
      // Staff -> Student needs no re-verification.
      onSwitchRole();
    } else {
      // Student -> Staff: show the explainer popover instead of switching instantly.
      setPopoverOpen((prev) => !prev);
    }
  };

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={popoverRef}>
      <button
        type="button"
        onClick={handlePillClick}
        title={isFaculty ? 'Staff mode (can add Food Corner inventory). Click to switch back to Student.' : 'Student mode.'}
        className={`hidden md:flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors cursor-pointer ${
          isFaculty
            ? 'bg-[#003DA5]/10 border-[#003DA5] text-[#003DA5]'
            : 'bg-[#F1F4F9] border-[#E1E6EF] text-[#6B7280] hover:text-[#041E42]'
        }`}
      >
        <MaterialIcon name="school" size={14} />
        <span>{isFaculty ? 'Staff' : 'Student'}</span>
      </button>

      {/* Popover anchored to the pill, formatted like the Dips explainer */}
      {popoverOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-[#E1E6EF] rounded-[14px] shadow-xl p-4 z-40 text-left animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-[#E1E6EF] text-xs font-bold text-[#041E42]">
            <MaterialIcon name="school" size={16} className="text-[#003DA5]" />
            <span>Switch Role</span>
          </div>

          <div className="text-xs text-[#041E42]">
            <p className="leading-relaxed">
              Not a student? 
            </p>
            <button
              type="button"
              onClick={() => {
                setPopoverOpen(false);
                onSwitchRole();
              }}
              className="mt-2 text-[#003DA5] hover:text-[#041E42] font-semibold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
            >
              <span>Log in as staff</span>
              <MaterialIcon name="arrow_forward" size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
