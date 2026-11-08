import React, { useState } from 'react';
import { FoodItem } from '../types';
import { MaterialIcon } from './MaterialIcon';
import { uploadImage } from '../lib/api';

const ALLERGEN_OPTIONS = ['None', 'Dairy', 'Gluten', 'Nuts', 'Soy', 'Eggs', 'Shellfish'];

interface FoodCornerViewProps {
  foodItems: FoodItem[];
  isFaculty: boolean;
  onAddInventory: (newItem: Omit<FoodItem, 'id' | 'claimedCount'>) => void;
}

export const FoodCornerView: React.FC<FoodCornerViewProps> = ({
  foodItems,
  isFaculty,
  onAddInventory,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState('');
  const [allergens, setAllergens] = useState('None');
  const [notes, setNotes] = useState('');
  const [totalSlots, setTotalSlots] = useState('15');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setPhotos((prev) => [...prev, url]);
      if (error) setError(null);
    } catch (err) {
      console.error(err);
      setError('Photo upload failed. Please try again.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateFood = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !quantity.trim()) {
      setError('Food name and quantity are required.');
      return;
    }

    const allergenNote = allergens !== 'None' ? `Allergens: ${allergens}.` : '';
    const combinedNotes = [allergenNote, notes.trim()].filter(Boolean).join(' ');

    onAddInventory({
      title: title.trim(),
      quantity: quantity.trim(),
      pickupLocation: 'Food Corner (demo)',
      hours: '',
      posterRole: 'Faculty / Department Sponsor',
      posterEmail: 'faculty-sponsor@fandm.edu',
      notes: combinedNotes || undefined,
      totalSlots: parseInt(totalSlots, 10) || 15,
      photos,
    });

    setTitle('');
    setQuantity('');
    setAllergens('None');
    setNotes('');
    setPhotos([]);
    setError(null);
    setModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E1E6EF] mb-6">
        <div>
          <h1 className="text-[2rem] font-bold text-[#041E42] tracking-tight">
            Food Corner
          </h1>
          <p className="text-sm text-[#6B7280] font-medium mt-0.5">
            Free food i guess
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Faculty only: Add inventory */}
          {isFaculty && (
            <button
              onClick={() => setModalOpen(true)}
              className="px-4 py-2 bg-[#003DA5] hover:bg-[#041E42] text-white text-xs font-semibold rounded-[0.75rem] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <MaterialIcon name="add" size={16} />
              <span>Add inventory</span>
            </button>
          )}

          {/* Student action button on header at far right: Schedule appointment */}
          <a
            href="https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ1hjzGn6vz--S3UVn3yZxPV7l5TcTFUPXUZ5I7biyBCk_gdUM-5txALoofiAAyIMHmX_4GiiWjY"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white hover:bg-[#F1F4F9] text-[#041E42] border border-[#E1E6EF] text-xs font-semibold rounded-[0.75rem] transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <MaterialIcon name="calendar_month" size={16} />
            <span>Schedule Appointment</span>
          </a>
        </div>
      </div>

      {/* Food items grid — mirrors the GATR gallery: square photo, Free price pill, name below */}
      {foodItems.length === 0 ? (
        <div className="py-16 text-center text-[#6B7280] bg-[#F1F4F9] rounded-[14px] border border-[#E1E6EF]">
          <MaterialIcon name="restaurant" size={36} className="text-[#6B7280]/60 mb-2" />
          <p className="text-sm font-semibold text-[#041E42]">No food listings right now.</p>
          <p className="text-xs text-[#6B7280] mt-1">Check back after seminars, club meetings, and department lunches.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
          {foodItems.map((item) => {
            const primaryPhoto = item.photos && item.photos.length > 0 ? item.photos[0] : null;
            return (
              <div
                key={item.id}
                className="relative bg-white overflow-hidden hover-card-shadow select-none flex flex-col"
              >
                <div className="group relative aspect-square w-full bg-[#F1F4F9] overflow-hidden">
                  {primaryPhoto ? (
                    <img
                      src={primaryPhoto}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <img
                      src="/assets/no-img.png"
                      alt="No photo available"
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Hover overlay: name, date posted, brand, allergen, amount */}
                  <div className="absolute inset-0 bg-[#F1F4F9]/95 opacity-0 group-hover:opacity-100 transition-opacity duration-150 flex flex-col items-start justify-start text-left p-2 gap-0.5 pointer-events-none">
                    <span className="text-sm font-bold text-[#041E42] leading-snug">{item.title}</span>
                    {item.datePost && (
                      <span className="text-xs font-medium text-[#6B7280]">{item.datePost}</span>
                    )}
                    {item.brand && (
                      <span className="text-xs text-[#041E42]">{item.brand}</span>
                    )}
                    {item.allergen && (
                      <span className="text-xs text-[#6B7280]">Allergen: {item.allergen}</span>
                    )}
                    {item.quantity && (
                      <span className="text-xs text-[#6B7280]">Amount: {item.quantity}</span>
                    )}
                  </div>

                  <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
                    <span className="bg-[#041E42]/90 backdrop-blur-xs text-white text-xs font-bold px-2 py-0.5 rounded-sm tracking-tight shadow-xs">
                      Free
                    </span>
                  </div>
                </div>

                <div className="pt-1.5 pb-2 px-1">
                  <h3 className="text-[0.95rem] font-medium text-[#041E42] truncate leading-tight">
                    {item.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Faculty Add Inventory Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#041E42]/50 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md bg-white rounded-[14px] shadow-xl border border-[#E1E6EF] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E1E6EF] flex items-center justify-between">
              <h2 className="text-base font-bold text-[#041E42]">Add Food Inventory</h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-[#6B7280] hover:text-[#041E42] rounded-md hover:bg-[#F1F4F9] cursor-pointer"
              >
                <MaterialIcon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateFood} className="p-6 space-y-3.5">
              {error && (
                <p className="text-xs text-red-600 font-medium" role="alert">
                  {error}
                </p>
              )}

              <div>
                <label className="block text-xs font-bold text-[#041E42] uppercase tracking-wider mb-1.5">
                  Photo (Optional)
                </label>
                <div className="border-2 border-dashed border-[#E1E6EF] rounded-[0.75rem] p-4 text-center bg-[#F1F4F9]">
                  <input
                    type="file"
                    id="food-photo-upload"
                    accept="image/png, image/jpeg"
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  <label
                    htmlFor="food-photo-upload"
                    className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white border border-[#E1E6EF] rounded-[0.75rem] text-xs font-semibold text-[#041E42] hover:bg-[#E1E6EF] transition-colors ${
                      uploading ? 'opacity-60 pointer-events-none' : ''
                    }`}
                  >
                    <MaterialIcon name="upload" size={16} />
                    <span>{uploading ? 'Uploading…' : 'Upload PNG or JPG'}</span>
                  </label>
                </div>

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
              </div>

              <div>
                <label className="block text-xs font-bold text-[#041E42] uppercase tracking-wider mb-1">
                  Food name
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Lidl Pea Soup"
                  className="w-full px-3 py-2 bg-[#F1F4F9] border border-[#E1E6EF] rounded-[0.75rem] text-xs text-[#041E42] focus:outline-none focus:ring-2 focus:ring-[#003DA5]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#041E42] uppercase tracking-wider mb-1">
                  Allergens
                </label>
                <select
                  value={allergens}
                  onChange={(e) => setAllergens(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F1F4F9] border border-[#E1E6EF] rounded-[0.75rem] text-xs text-[#041E42] focus:outline-none focus:ring-2 focus:ring-[#003DA5]"
                >
                  {ALLERGEN_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#041E42] uppercase tracking-wider mb-1">
                  Quantity
                </label>
                <input
                  type="text"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 12 vegetarian wraps"
                  className="w-full px-3 py-2 bg-[#F1F4F9] border border-[#E1E6EF] rounded-[0.75rem] text-xs text-[#041E42] focus:outline-none focus:ring-2 focus:ring-[#003DA5]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#041E42] uppercase tracking-wider mb-1">
                  Additional Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Allergens, packaging, or special instructions"
                  className="w-full px-3 py-2 bg-[#F1F4F9] border border-[#E1E6EF] rounded-[0.75rem] text-xs text-[#041E42] focus:outline-none focus:ring-2 focus:ring-[#003DA5]"
                />
              </div>

              <div className="pt-3 border-t border-[#E1E6EF] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-[#041E42] hover:bg-[#F1F4F9] rounded-[0.75rem] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#003DA5] hover:bg-[#041E42] text-white text-xs font-semibold rounded-[0.75rem] transition-colors cursor-pointer"
                >
                  Post Food
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
