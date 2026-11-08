import React from 'react';
import { MaterialIcon } from './MaterialIcon';

interface GATRGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GATRGuideModal: React.FC<GATRGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#041E42]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gatr-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-[14px] shadow-xl border border-[#E1E6EF] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E1E6EF] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MaterialIcon name="volunteer_activism" size={20} className="text-[#003DA5]" />
            <h2 id="gatr-modal-title" className="text-base font-bold text-[#041E42]">
              Donate to Give and Take Room (GATR)
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
        <div className="p-6 space-y-4 text-sm text-[#041E42]">
          <p className="font-semibold text-base">
            How to donate items to the F&amp;M Give and Take Room:
          </p>

          <div className="bg-[#F1F4F9] p-4 rounded-[0.75rem] border border-[#E1E6EF] space-y-2">
            <p className="font-bold text-xs uppercase tracking-wider text-[#003DA5]">
              Step 1: Check your items
            </p>
            <p className="text-xs text-[#041E42]">
              Ensure all items are clean, functional, and safe. Acceptable items include school supplies, desk organizers, small working electronics, kitchenware, and seasonal decor.
              You may also drop of broken electronics so that the e-waste can be recycled. For more information on  
              what to donate or guidelines on using the space, please email GATR@fandm.edu. 
            </p>
          </div>

          <div className="bg-[#F1F4F9] p-4 rounded-[0.75rem] border border-[#E1E6EF] space-y-2">
            <p className="font-bold text-xs uppercase tracking-wider text-[#003DA5]">
              Step 2: Bringing your items to donate
            </p>
            <p className="text-xs text-[#041E42]">
              In addition to the bins located in the Residence Halls, feel free to stop by the GATR to drop off any lightly used goods.  
            </p>
          </div>

          <div className="bg-[#F1F4F9] p-4 rounded-[0.75rem] border border-[#E1E6EF] space-y-2">
            <p className="font-bold text-xs uppercase tracking-wider text-[#003DA5]">
             Give and Take Room Hours
            </p>
            <p className="text-xs text-[#041E42]">
              During the fall 2026 semester, the GATR will be open during the below times:
            </p>
            <p className="text-xs text-[#041E42] leading-relaxed">
              Monday: 4 pm to 6 pm<br />
              Tuesday: 8:30 am to 11:30 am<br />
              Wednesday: 4 pm to 6 pm<br />
              Thursday: 8:30 am to 11:30 am<br />
              Friday: 10 am to 1 pm<br />
              Saturday: 1 pm to 4 pm
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#F1F4F9] border-t border-[#E1E6EF] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#003DA5] hover:bg-[#041E42] text-white text-xs font-semibold rounded-[0.75rem] transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
