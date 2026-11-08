import React, { useState, useRef, useEffect } from 'react';
import { ListingItem } from '../types';
import { MaterialIcon } from './MaterialIcon';
import { formatPrice, buildMetaLine } from '../utils/filter';

interface ListingCardProps {
  item: ListingItem;
  isSaved: boolean;
  onToggleSave: (e: React.MouseEvent, id: string) => void;
  onClick: (item: ListingItem) => void;
  showOwnerMenu?: boolean;
  onEdit?: (item: ListingItem) => void;
  onToggleStatus?: (item: ListingItem) => void;
  onDelete?: (id: string) => void;
  hideHeart?: boolean;
  forceFree?: boolean;
  showHoverDetails?: boolean;
  disableClick?: boolean;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  item,
  isSaved,
  onToggleSave,
  onClick,
  showOwnerMenu = false,
  onEdit,
  onToggleStatus,
  onDelete,
  hideHeart = false,
  forceFree = false,
  showHoverDetails = false,
  disableClick = false,
}) => {
  const [imageError, setImageError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [heartPopped, setHeartPopped] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeartPopped(true);
    setTimeout(() => setHeartPopped(false), 300);
    onToggleSave(e, item.id);
  };

  const primaryPhoto = item.photos && item.photos.length > 0 ? item.photos[0] : null;
  const metaLine = buildMetaLine({
    size: item.size,
    brand: item.brand,
    condition: item.condition,
  });

  return (
    <div
      onClick={disableClick ? undefined : () => onClick(item)}
      className={`group relative bg-white overflow-hidden hover-card-shadow select-none flex flex-col ${
        disableClick ? '' : 'cursor-pointer'
      }`}
      role={disableClick ? undefined : 'button'}
      tabIndex={disableClick ? undefined : 0}
      onKeyDown={
        disableClick
          ? undefined
          : (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(item);
              }
            }
      }
      aria-label={`${item.name}, ${formatPrice(item.price)}, condition ${item.condition}`}
    >
      {/* 1:1 Square Photo Container: Corner radius is 0 for edge-to-edge wall */}
      <div className="relative aspect-square w-full bg-[#F1F4F9] overflow-hidden">
        {primaryPhoto && !imageError ? (
          <img
            src={primaryPhoto}
            alt={item.name}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02] ${
              item.status === 'sold' ? 'opacity-50 grayscale-[40%]' : ''
            }`}
            loading="lazy"
          />
        ) : (
          <img
            src="/assets/no-img.png"
            alt="No photo available"
            className="w-full h-full object-cover"
          />
        )}

        {/* Sold Stamp overlay if sold */}
        {item.status === 'sold' && (
          <div className="absolute inset-0 bg-[#041E42]/20 flex items-center justify-center pointer-events-none">
            <span className="bg-[#6B7280] text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded shadow-sm">
              Sold
            </span>
          </div>
        )}

        {/* Heart Icon top-right over photo */}
        {!hideHeart && (
          <button
            type="button"
            onClick={handleHeartClick}
            className={`absolute top-2 right-2 w-7.5 h-7.5 flex items-center justify-center rounded-full bg-white/80 hover:bg-white text-[#041E42] backdrop-blur-sm transition-transform cursor-pointer z-10 ${
              heartPopped ? 'scale-125' : 'scale-100'
            }`}
            aria-label={isSaved ? `Remove ${item.name} from saved items` : `Save ${item.name}`}
            title={isSaved ? 'Saved' : 'Save'}
          >
            <MaterialIcon
              name="favorite"
              filled={isSaved}
              size={18}
              className={isSaved ? 'text-[#003DA5]' : 'text-[#041E42]'}
            />
          </button>
        )}

        {/* Owner Menu Trigger (for owned cards on Profile) */}
        {showOwnerMenu && (
          <div className="absolute top-2 left-2 z-20" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1 rounded-full bg-white/90 hover:bg-white text-[#041E42] shadow-sm cursor-pointer opacity-90 group-hover:opacity-100 transition-opacity"
              aria-label="Manage listing"
              title="Listing options"
            >
              <MaterialIcon name="more_vert" size={18} />
            </button>

            {menuOpen && (
              <div
                className="absolute left-0 mt-1 w-36 bg-white border border-[#E1E6EF] rounded-lg shadow-lg py-1 z-30 text-left text-xs"
                onClick={(e) => e.stopPropagation()}
              >
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(item);
                    }}
                    className="w-full px-3 py-1.5 text-left text-[#041E42] hover:bg-[#F1F4F9] flex items-center gap-2 cursor-pointer"
                  >
                    <MaterialIcon name="edit" size={14} />
                    <span>Edit</span>
                  </button>
                )}

                {onToggleStatus && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onToggleStatus(item);
                    }}
                    className="w-full px-3 py-1.5 text-left text-[#041E42] hover:bg-[#F1F4F9] flex items-center gap-2 cursor-pointer"
                  >
                    <MaterialIcon name={item.status === 'sold' ? 'check_circle' : 'remove_done'} size={14} />
                    <span>{item.status === 'sold' ? 'Mark as available' : 'Mark as sold'}</span>
                  </button>
                )}

                {onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(item.id);
                    }}
                    className="w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
                  >
                    <MaterialIcon name="delete" size={14} className="text-red-600" />
                    <span>Delete</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Hover overlay: name, date posted, meta line, description */}
        {showHoverDetails && (
          <div className="absolute inset-0 bg-[#F1F4F9]/95 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col items-start justify-start text-left p-2 gap-0.5 pointer-events-none">
            <span className="text-sm font-bold text-[#041E42] leading-snug">{item.name}</span>
            {item.createdAt && (
              <span className="text-xs font-medium text-[#6B7280]">
                {new Date(item.createdAt).toLocaleDateString('en-US')}
              </span>
            )}
            {metaLine && (
              <span className="text-xs text-[#041E42]">{metaLine}</span>
            )}
            {item.description && (
              <span className="text-xs text-[#6B7280] leading-snug">{item.description}</span>
            )}
          </div>
        )}

        {/* Price Pill: bottom-left over the photo */}
        <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
          <span className="bg-[#041E42]/90 backdrop-blur-xs text-white text-xs font-bold px-2 py-0.5 rounded-sm tracking-tight shadow-xs">
            {forceFree ? 'Free' : formatPrice(item.price)}
          </span>
        </div>
      </div>

      {/* Item Name: Exactly one line, truncates with an ellipsis rather than wrapping */}
      <div className="pt-1.5 pb-2 px-1">
        <h3 className="text-[0.95rem] font-medium text-[#041E42] truncate leading-tight">
          {item.name}
        </h3>
      </div>
    </div>
  );
};
