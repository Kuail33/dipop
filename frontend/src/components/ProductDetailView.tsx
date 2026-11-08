import React, { useState, useRef } from 'react';
import { ListingItem } from '../types';
import { MaterialIcon } from './MaterialIcon';
import { formatPrice, buildMetaLine } from '../utils/filter';
import { ListingCard } from './ListingCard';

interface ProductDetailViewProps {
  item: ListingItem;
  allListings: ListingItem[];
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent, id: string) => void;
  onBack: () => void;
  onSelectItem: (item: ListingItem) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  item,
  allListings,
  isSaved,
  onToggleSave,
  onBack,
  onSelectItem,
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [imgError, setImgError] = useState(false);
  const photos = item.photos && item.photos.length > 0 ? item.photos : [];

  const touchStartX = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const SWIPE_THRESHOLD = 40;
  const RUBBER_BAND = 0.35;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (photos.length <= 1) return;
    touchStartX.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null || photos.length <= 1) return;
    let delta = e.touches[0].clientX - touchStartX.current;
    if (activePhotoIndex === 0 && delta > 0) delta *= RUBBER_BAND;
    if (activePhotoIndex === photos.length - 1 && delta < 0) delta *= RUBBER_BAND;
    setDragOffset(delta);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || photos.length <= 1) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (deltaX > SWIPE_THRESHOLD) {
      setActivePhotoIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    } else if (deltaX < -SWIPE_THRESHOLD) {
      setActivePhotoIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    }
    touchStartX.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  // Filter other stuff from same poster (excluding this item and sold items if public)
  const otherItemsFromSeller = allListings.filter(
    (other) =>
      other.sellerEmail === item.sellerEmail &&
      other.id !== item.id &&
      other.status === 'available'
  ).slice(0, 4);

  const formattedDate = new Date(item.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const metaLine = buildMetaLine({
    size: item.size,
    brand: item.brand,
    condition: item.condition,
  });

  const mailtoLink = `mailto:${item.sellerEmail}?subject=${encodeURIComponent(
    `dipop: ${item.name}`
  )}&body=${encodeURIComponent(
    `Hi ${item.sellerName},\n\nI saw your listing for "${item.name}" on dipop and I am interested. Is it still available for pickup at ${
      item.pickupLocation || 'campus'
    }?\n\nThanks!`
  )}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Back to listings button */}
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm font-semibold text-[#003DA5] hover:text-[#041E42] mb-5 cursor-pointer p-1 rounded focus:outline-none focus:ring-2 focus:ring-[#003DA5]"
      >
        <MaterialIcon name="arrow_back" size={18} />
        <span>Back to listings</span>
      </button>

      {/* Two-column layout on desktop (image left, details right); stacks on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
        {/* Left column: photo */}
        <div>
          {/* Hero Image / Carousel */}
          <div
            className="relative aspect-square w-full bg-[#F1F4F9] overflow-hidden rounded-none border border-[#E1E6EF]"
            style={{ touchAction: 'pan-y' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
        {photos.length > 0 && !imgError ? (
          <div
            className="absolute inset-0 flex h-full"
            style={{
              width: `${photos.length * 100}%`,
              transform: `translateX(calc(-${activePhotoIndex * (100 / photos.length)}% + ${dragOffset}px))`,
              transition: isDragging ? 'none' : 'transform 350ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {photos.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt={item.name}
                draggable={false}
                onError={() => setImgError(true)}
                className={`h-full object-cover shrink-0 ${
                  item.status === 'sold' ? 'opacity-40 grayscale-[50%]' : ''
                }`}
                style={{ width: `${100 / photos.length}%` }}
              />
            ))}
          </div>
        ) : (
          <img
            src="/assets/no-img.png"
            alt="No photo available"
            className="w-full h-full object-cover"
          />
        )}

        {/* Sold Stamp */}
        {item.status === 'sold' && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#041E42]/25 pointer-events-none">
            <span className="bg-[#6B7280] text-white text-sm font-bold uppercase tracking-widest px-4 py-1.5 rounded shadow-md">
              Sold
            </span>
          </div>
        )}

        {/* Multi-photo previous/next controls */}
        {photos.length > 1 && (
          <>
            <button
              onClick={() =>
                setActivePhotoIndex((prev) =>
                  prev === 0 ? photos.length - 1 : prev - 1
                )
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-[#041E42] shadow-sm cursor-pointer"
              aria-label="Previous photo"
            >
              <MaterialIcon name="chevron_left" size={20} />
            </button>
            <button
              onClick={() =>
                setActivePhotoIndex((prev) =>
                  prev === photos.length - 1 ? 0 : prev + 1
                )
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-[#041E42] shadow-sm cursor-pointer"
              aria-label="Next photo"
            >
              <MaterialIcon name="chevron_right" size={20} />
            </button>
          </>
        )}

        {/* Heart control on the hero image */}
        <button
          onClick={(e) => onToggleSave(e, item.id)}
          className="absolute top-3 right-3 w-9.5 h-9.5 flex items-center justify-center rounded-full bg-white/85 hover:bg-white text-[#041E42] backdrop-blur-sm shadow-sm cursor-pointer z-10"
          aria-label={isSaved ? 'Saved item' : 'Save item'}
        >
          <MaterialIcon
            name="favorite"
            filled={isSaved}
            size={22}
            className={isSaved ? 'text-[#003DA5]' : 'text-[#041E42]'}
          />
        </button>
      </div>

          {/* Multi-image dot indicators */}
          {photos.length > 1 && (
            <div className="flex justify-center gap-1.5 py-2.5">
              {photos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    activePhotoIndex === idx
                      ? 'bg-[#003DA5] w-5'
                      : 'bg-[#E1E6EF] hover:bg-[#6B7280]'
                  }`}
                  aria-label={`View photo ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right column: seller header, caption, actions */}
        <div>
          {/* Seller Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#E1E6EF] mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#041E42] text-white font-bold text-sm flex items-center justify-center">
                {item.sellerInitials}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#041E42] leading-tight">
                  {item.sellerName}
                </p>
                <p className="text-xs text-[#6B7280]">
                  Posted {formattedDate}
                </p>
              </div>
            </div>

            {item.pickupLocation && (
              <div className="flex items-center gap-1 text-xs text-[#6B7280]">
                <MaterialIcon name="location_on" size={15} />
                <span className="hidden sm:inline">{item.pickupLocation}</span>
              </div>
            )}
          </div>

      {/* Caption block */}
      <div className="pb-4 border-b border-[#E1E6EF]">
        <div className="flex items-baseline justify-between gap-4 mb-0.5">
          <h1 className="text-xl sm:text-2xl font-bold text-[#041E42] tracking-tight">
            {item.name}
          </h1>
          <span className="text-xl sm:text-2xl font-bold text-[#003DA5] whitespace-nowrap">
            {item.category === 'gatr' ? 'Free' : formatPrice(item.price)}
          </span>
        </div>

        {metaLine && (
          <p className="text-xs sm:text-sm text-[#6B7280] font-medium mb-3">
            {metaLine}
          </p>
        )}

        {item.description && (
          <p className="text-sm text-[#041E42] leading-relaxed whitespace-pre-line mb-0.5">
            {item.description}
          </p>
        )}

        {item.pickupLocation && (
          <p className="text-sm text-[#6B7280]">
            Pickup location: <span className="font-medium text-[#041E42]">{item.pickupLocation}</span>
          </p>
        )}
      </div>

      {/* Action Row: Two controls side by side, equal width buttons */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {/* Status pill on left: read-only */}
        <div
          className={`h-12 rounded-[0.75rem] flex items-center justify-center font-bold text-sm tracking-wide select-none ${
            item.status === 'available'
              ? 'bg-[#041E42] text-white'
              : 'bg-[#E1E6EF] text-[#6B7280]'
          }`}
          aria-label={`Listing status: ${item.status}`}
        >
          {item.status === 'available' ? 'Available' : 'Sold'}
        </div>

        {/* Reach out on right: filled in black/navy, opening mail app */}
        {item.status === 'available' ? (
          <a
            href={mailtoLink}
            className="h-12 rounded-[0.75rem] bg-[#041E42] hover:bg-[#003DA5] text-white font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MaterialIcon name="mail" size={18} />
            <span>Reach out</span>
          </a>
        ) : (
          <div className="h-12 rounded-[0.75rem] bg-[#F1F4F9] text-[#6B7280] font-bold text-sm flex items-center justify-center gap-2 select-none border border-[#E1E6EF]">
            <span>Item Sold</span>
          </div>
        )}
      </div>
        </div>
      </div>

      {/* Other stuff from poster name */}
      {otherItemsFromSeller.length > 0 && (
        <div className="mt-12 pt-6 border-t border-[#E1E6EF]">
          <h2 className="text-sm font-bold text-[#041E42] uppercase tracking-wider mb-3">
            Other stuff
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {otherItemsFromSeller.map((other) => (
              <ListingCard
                key={other.id}
                item={other}
                isSaved={false}
                onToggleSave={(e) => onToggleSave(e, other.id)}
                onClick={onSelectItem}
                hideHeart
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
