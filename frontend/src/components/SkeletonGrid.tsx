import React from 'react';

export const SkeletonGrid: React.FC<{ count?: number }> = ({ count = 8 }) => {
  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2"
      aria-label="Loading listings"
      role="status"
    >
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="flex flex-col animate-pulse">
          <div className="aspect-square w-full bg-[#F1F4F9] rounded-none relative">
            <div className="absolute bottom-2 left-2 w-12 h-5 bg-[#E1E6EF] rounded-sm" />
          </div>
          <div className="pt-2 px-1">
            <div className="h-4 bg-[#E1E6EF] rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
};
