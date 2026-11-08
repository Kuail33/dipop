import React, { useState } from 'react';
import { ItemCondition, ListingItem } from '../types';
import { MaterialIcon } from './MaterialIcon';
import { uploadImage } from '../lib/api';

interface PostItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemData: Omit<ListingItem, 'id' | 'createdAt' | 'status'>, editId?: string) => void;
  editItem?: ListingItem | null;
  userEmail: string;
}

const SAMPLE_PHOTOS = [
  { label: 'Hoodie', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80' },
  { label: 'Textbook', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Shoes', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80' },
  { label: 'Lamp', url: 'https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?auto=format&fit=crop&w=800&q=80' },
  { label: 'Gadget', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80' },
  { label: 'Storage', url: 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80' },
];

export const PostItemModal: React.FC<PostItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editItem,
  userEmail,
}) => {
  const [name, setName] = useState(editItem ? editItem.name : '');
  const [price, setPrice] = useState<string>(editItem ? String(editItem.price) : '');
  const [condition, setCondition] = useState<ItemCondition>(editItem ? editItem.condition : 'Good');
  const [size, setSize] = useState(editItem?.size || '');
  const [brand, setBrand] = useState(editItem?.brand || '');
  const [description, setDescription] = useState(editItem?.description || '');
  const [pickupLocation, setPickupLocation] = useState(editItem?.pickupLocation || '');
  const [photos, setPhotos] = useState<string[]>(editItem?.photos || []);
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');
  const [errors, setErrors] = useState<{ name?: string; photos?: string }>({});
  const [uploading, setUploading] = useState(false);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setPhotos((prev) => [...prev, url]);
      if (errors.photos) {
        setErrors((prev) => ({ ...prev, photos: undefined }));
      }
    } catch (err) {
      console.error(err);
      setErrors((prev) => ({ ...prev, photos: 'Upload failed. Please try again.' }));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleAddSamplePhoto = (url: string) => {
    if (!photos.includes(url)) {
      setPhotos((prev) => [...prev, url]);
      if (errors.photos) {
        setErrors((prev) => ({ ...prev, photos: undefined }));
      }
    }
  };

  const handleAddUrlPhoto = () => {
    if (customPhotoUrl.trim() && !photos.includes(customPhotoUrl.trim())) {
      setPhotos((prev) => [...prev, customPhotoUrl.trim()]);
      setCustomPhotoUrl('');
      if (errors.photos) {
        setErrors((prev) => ({ ...prev, photos: undefined }));
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: string; photos?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Item name is required.';
    }

    if (photos.length === 0) {
      newErrors.photos = 'Add at least one photo.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const numericPrice = price === '' || isNaN(Number(price)) ? 0 : Math.max(0, Number(price));

    onSubmit(
      {
        name: name.trim(),
        price: numericPrice,
        condition,
        size: size.trim() || undefined,
        brand: brand.trim() || undefined,
        description: description.trim() || undefined,
        pickupLocation: pickupLocation.trim() || undefined,
        photos,
        sellerName: userEmail.split('@')[0],
        sellerEmail: userEmail,
        sellerInitials: userEmail.slice(0, 2).toUpperCase(),
        category: 'marketplace',
      },
      editItem ? editItem.id : undefined
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#041E42]/50 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-xl bg-white rounded-[14px] shadow-xl border border-[#E1E6EF] overflow-hidden my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#E1E6EF] flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-bold text-[#041E42]">
            {editItem ? 'Edit listing' : 'Post item'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-[#6B7280] hover:text-[#041E42] rounded-md hover:bg-[#F1F4F9] cursor-pointer"
            aria-label="Close modal"
          >
            <MaterialIcon name="close" size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Photos */}
          <div>
            <label className="block text-xs font-bold text-[#041E42] uppercase tracking-wider mb-1.5">
              Photos (Required)
            </label>
            <div className="border-2 border-dashed border-[#E1E6EF] rounded-[0.75rem] p-4 text-center bg-[#F1F4F9]">
              <input
                type="file"
                id="photo-upload"
                accept="image/png, image/jpeg"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
              <label
                htmlFor="photo-upload"
                className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E1E6EF] rounded-[0.75rem] text-xs font-semibold text-[#041E42] hover:bg-[#E1E6EF] transition-colors ${
                  uploading ? 'opacity-60 pointer-events-none' : ''
                }`}
              >
                <MaterialIcon name="upload" size={16} />
                <span>{uploading ? 'Uploading…' : 'Upload PNG or JPG'}</span>
              </label>

              <div className="mt-3 text-xs text-[#6B7280]">
                Or select a campus photo sample:
              </div>
              <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                {SAMPLE_PHOTOS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddSamplePhoto(sample.url)}
                    className="text-[11px] px-2.5 py-1 bg-white hover:bg-[#E1E6EF] text-[#041E42] border border-[#E1E6EF] rounded-md cursor-pointer"
                  >
                    + {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Photo Preview Strip */}
            {photos.length > 0 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {photos.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded border border-[#E1E6EF] overflow-hidden shrink-0">
                    <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-0 right-0 bg-[#041E42] text-white p-0.5 rounded-bl hover:bg-red-600 cursor-pointer"
                      aria-label="Remove photo"
                    >
                      <MaterialIcon name="close" size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.photos && (
              <p className="text-xs text-red-600 mt-1.5 font-medium flex items-center gap-1" role="alert">
                <MaterialIcon name="error" size={14} className="text-red-600" />
                <span>{errors.photos}</span>
              </p>
            )}
          </div>

          {/* Item Name */}
          <div>
            <label htmlFor="item-name" className="block text-xs font-bold text-[#041E42] uppercase tracking-wider mb-1.5">
              Item Name (Required)
            </label>
            <input
              id="item-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g. Navy Nike hoodie"
              className={`w-full px-3.5 py-2.5 bg-[#F1F4F9] border ${
                errors.name ? 'border-red-500' : 'border-[#E1E6EF]'
              } rounded-[0.75rem] text-sm text-[#041E42] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#003DA5]`}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1" role="alert">
                <MaterialIcon name="error" size={14} className="text-red-600" />
                <span>{errors.name}</span>
              </p>
            )}
          </div>

          {/* Price & Condition */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="item-price" className="block text-xs font-bold text-[#041E42] uppercase tracking-wider mb-1.5">
                Price (0 means free)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-semibold text-[#6B7280]">$</span>
                <input
                  id="item-price"
                  type="number"
                  min="0"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className="w-full pl-7 pr-3 py-2.5 bg-[#F1F4F9] border border-[#E1E6EF] rounded-[0.75rem] text-sm text-[#041E42] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#003DA5]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="item-condition" className="block text-xs font-bold text-[#041E42] uppercase tracking-wider mb-1.5">
                Condition (Required)
              </label>
              <select
                id="item-condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className="w-full px-3 py-2.5 bg-[#F1F4F9] border border-[#E1E6EF] rounded-[0.75rem] text-sm text-[#041E42] focus:outline-none focus:ring-2 focus:ring-[#003DA5]"
              >
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>

          {/* Size & Brand */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="item-size" className="block text-xs font-bold text-[#041E42] uppercase tracking-wider mb-1.5">
                Size (Optional)
              </label>
              <input
                id="item-size"
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="M"
                className="w-full px-3.5 py-2.5 bg-[#F1F4F9] border border-[#E1E6EF] rounded-[0.75rem] text-sm text-[#041E42] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#003DA5]"
              />
            </div>

            <div>
              <label htmlFor="item-brand" className="block text-xs font-bold text-[#041E42] uppercase tracking-wider mb-1.5">
                Brand (Optional)
              </label>
              <input
                id="item-brand"
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Nike"
                className="w-full px-3.5 py-2.5 bg-[#F1F4F9] border border-[#E1E6EF] rounded-[0.75rem] text-sm text-[#041E42] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#003DA5]"
              />
            </div>
          </div>

          {/* Pickup location */}
          <div>
            <label htmlFor="item-pickup" className="block text-xs font-bold text-[#041E42] uppercase tracking-wider mb-1.5">
              Pickup location (Optional)
            </label>
            <input
              id="item-pickup"
              type="text"
              value={pickupLocation}
              onChange={(e) => setPickupLocation(e.target.value)}
              placeholder="Dorm or building (e.g. College Row or Brooks)"
              className="w-full px-3.5 py-2.5 bg-[#F1F4F9] border border-[#E1E6EF] rounded-[0.75rem] text-sm text-[#041E42] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#003DA5]"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="item-desc" className="block text-xs font-bold text-[#041E42] uppercase tracking-wider mb-1.5">
              Description (Optional)
            </label>
            <textarea
              id="item-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Barely worn, pickup near College Row"
              className="w-full px-3.5 py-2.5 bg-[#F1F4F9] border border-[#E1E6EF] rounded-[0.75rem] text-sm text-[#041E42] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#003DA5]"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-[#E1E6EF] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-semibold text-[#041E42] hover:bg-[#F1F4F9] rounded-[0.75rem] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#003DA5] hover:bg-[#041E42] text-white text-xs font-semibold rounded-[0.75rem] transition-colors cursor-pointer"
            >
              {editItem ? 'Update listing' : 'Post item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
