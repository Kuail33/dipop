/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ListingItem, FoodItem, TabType, SortOption } from './types';
import { filterAndSortListings, isValidLoginEmail } from './utils/filter';
import * as api from './lib/api';
import { LoginGate } from './components/LoginGate';
import { TopBar } from './components/TopBar';
import { MarketplaceView } from './components/MarketplaceView';
import { ProductDetailView } from './components/ProductDetailView';
import { FoodCornerView } from './components/FoodCornerView';
import { GiveAndTakeView } from './components/GiveAndTakeView';
import { ProfileView } from './components/ProfileView';
import { PostItemModal } from './components/PostItemModal';
import { GATRGuideModal } from './components/GATRGuideModal';
import { RewardsModal } from './components/RewardsModal';
import { RewardDiplomatModal } from './components/RewardDiplomatModal';
import { Toast, ToastMessage } from './components/Toast';

export default function App() {
  // Authentication state
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      return 'student@fandm.edu';
    }
    const stored = localStorage.getItem('dipop_user_email');
    if (stored && isValidLoginEmail(stored)) {
      return stored;
    }
    return null;
  });

  // Role is derived from which fake account signed in — not a separate toggle.
  const isFaculty = currentUserEmail?.toLowerCase() === 'staff@fandm.edu';

  // Navigation tab
  const [currentTab, setCurrentTab] = useState<TabType>('marketplace');
  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);

  // Dips points balance ledger
  const [dipsBalances, setDipsBalances] = useState<Record<string, number>>(() => {
    const stored = localStorage.getItem('dipop_dips_balances');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return {};
      }
    }
    return {};
  });

  // Listings state (fetched from the backend; see fetch effect below)
  const [listings, setListings] = useState<ListingItem[]>([]);

  // Food corner items (fetched from the backend; see fetch effect below)
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);

  // Saved listing IDs
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    const stored = localStorage.getItem('dipop_saved_ids');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    return [];
  });

  // Modals state
  const [sellModalOpen, setSellModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ListingItem | null>(null);
  const [gatrGuideOpen, setGatrGuideOpen] = useState(false);
  const [rewardsModalOpen, setRewardsModalOpen] = useState(false);
  const [rewardDiplomatModalOpen, setRewardDiplomatModalOpen] = useState(false);

  // Filter & Search states
  const [sort, setSort] = useState<SortOption>('newest');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load live listings (marketplace + give-and-take) from the backend
  useEffect(() => {
    setIsLoading(true);
    api
      .fetchListings()
      .then((data) => setListings(data))
      .catch((err) => {
        console.error(err);
        addToast('Could not load listings from server');
      })
      .finally(() => setIsLoading(false));
  }, [addToast]);

  // Load live food corner items from the backend
  useEffect(() => {
    api
      .fetchFood()
      .then((data) => setFoodItems(data))
      .catch((err) => {
        console.error(err);
        addToast('Could not load food corner items from server');
      });
  }, [addToast]);

  // Sync to local storage
  useEffect(() => {
    if (currentUserEmail) {
      localStorage.setItem('dipop_user_email', currentUserEmail);
    } else {
      localStorage.removeItem('dipop_user_email');
    }
  }, [currentUserEmail]);

  useEffect(() => {
    localStorage.setItem('dipop_dips_balances', JSON.stringify(dipsBalances));
  }, [dipsBalances]);

  useEffect(() => {
    localStorage.setItem('dipop_saved_ids', JSON.stringify(savedIds));
  }, [savedIds]);

  // Current user's dips balance
  const currentUserDips = useMemo(() => {
    if (!currentUserEmail) return 0;
    const key = currentUserEmail.toLowerCase();
    return dipsBalances[key] !== undefined ? dipsBalances[key] : 0;
  }, [currentUserEmail, dipsBalances]);

  // Handle Login
  const handleLogin = (email: string) => {
    setCurrentUserEmail(email);
    // Initialize dips if new user
    const key = email.toLowerCase();
    if (dipsBalances[key] === undefined) {
      setDipsBalances((prev) => ({ ...prev, [key]: 0 }));
    }
    addToast('Signed in to dipop');
  };

  const handleSignOut = () => {
    setCurrentUserEmail(null);
    localStorage.removeItem('dipop_user_email');
    setSelectedItem(null);
  };

  // Toggle Save
  const handleToggleSave = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setSavedIds((prev) => {
      if (prev.includes(itemId)) {
        addToast('Removed from saves');
        return prev.filter((id) => id !== itemId);
      } else {
        addToast('Saved');
        return [...prev, itemId];
      }
    });
  };

  // Toggle Item Status (Mark as sold / Mark as available)
  const handleToggleItemStatus = (item: ListingItem) => {
    const prevStatus = item.status;
    const nextStatus = prevStatus === 'available' ? 'sold' : 'available';
    setListings((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: nextStatus } : i))
    );
    if (selectedItem && selectedItem.id === item.id) {
      setSelectedItem({ ...selectedItem, status: nextStatus });
    }
    api
      .setListingStatus(item.category, item.id, nextStatus, currentUserEmail ?? '')
      .then(() => {
        addToast(nextStatus === 'sold' ? 'Marked sold' : 'Marked available');
      })
      .catch((err) => {
        console.error(err);
        setListings((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, status: prevStatus } : i))
        );
        if (selectedItem && selectedItem.id === item.id) {
          setSelectedItem({ ...selectedItem, status: prevStatus });
        }
        addToast('Failed to update status');
      });
  };

  // Delete Item
  const handleDeleteItem = (itemId: string) => {
    const item = listings.find((i) => i.id === itemId);
    if (!item) return;
    setListings((prev) => prev.filter((i) => i.id !== itemId));
    setSavedIds((prev) => prev.filter((id) => id !== itemId));
    if (selectedItem && selectedItem.id === itemId) {
      setSelectedItem(null);
    }
    api
      .deleteListing(item.category, itemId, currentUserEmail ?? '')
      .then(() => addToast('Listing deleted'))
      .catch((err) => {
        console.error(err);
        setListings((prev) => [item, ...prev]);
        addToast('Failed to delete listing');
      });
  };

  // Create or Update Listing
  const handlePostItem = async (
    itemData: Omit<ListingItem, 'id' | 'createdAt' | 'status'>,
    editId?: string
  ) => {
    try {
      if (editId) {
        const existing = listings.find((i) => i.id === editId);
        const category = existing?.category ?? itemData.category;
        const updated = await api.editListing(category, editId, itemData, currentUserEmail ?? '');
        setListings((prev) => prev.map((item) => (item.id === editId ? updated : item)));
        if (selectedItem && selectedItem.id === editId) {
          setSelectedItem(updated);
        }
        addToast('Listing updated');
      } else {
        const created = await api.createListing(itemData);
        setListings((prev) => [created, ...prev]);
        addToast('Posted');
      }
      setSellModalOpen(false);
      setEditingItem(null);
    } catch (err) {
      console.error(err);
      addToast('Something went wrong. Please try again.');
    }
  };

  // Faculty add food inventory
  const handleAddFoodInventory = (
    newItem: Omit<FoodItem, 'id' | 'claimedCount'>
  ) => {
    const item: FoodItem = {
      ...newItem,
      id: `food-${Date.now()}`,
      claimedCount: 0,
    };
    setFoodItems((prev) => [item, ...prev]);
    addToast('Food inventory added');
  };

  // Award Dips (Faculty to student donor)
  const handleAwardDips = (donorEmail: string, amount: number, note?: string) => {
    const key = donorEmail.toLowerCase();
    setDipsBalances((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + amount,
    }));
    addToast(`Awarded ${amount} Dipomine to ${donorEmail}`);
  };

  // Redeem a Dipomine reward tier
  const handleRedeemReward = (dipsToSpend: number, rewardLabel: string) => {
    if (!currentUserEmail) return;
    const key = currentUserEmail.toLowerCase();
    const current = dipsBalances[key] || 0;
    if (current < dipsToSpend) return;
    setDipsBalances((prev) => ({
      ...prev,
      [key]: current - dipsToSpend,
    }));
    addToast(`Redeemed ${dipsToSpend.toLocaleString()} Dipomine for ${rewardLabel}`);
  };

  // Clear filters
  const handleClearFilters = () => {
    setMinPrice(0);
    setMaxPrice(1000);
    setSearchQuery('');
    setSort('newest');
  };

  // Filtered public marketplace listings
  const marketplaceListings = useMemo(() => {
    return filterAndSortListings(listings, {
      sort,
      minPrice,
      maxPrice,
      searchQuery,
      includeSold: false,
      category: 'marketplace',
    });
  }, [listings, sort, minPrice, maxPrice, searchQuery]);

  // Give and Take listings
  const gatrListings = useMemo(() => {
    return listings.filter((item) => item.category === 'gatr' && item.status === 'available');
  }, [listings]);

  // User's own listings
  const userListings = useMemo(() => {
    if (!currentUserEmail) return [];
    return listings.filter(
      (item) =>
        item.sellerEmail.toLowerCase() === currentUserEmail.toLowerCase()
    );
  }, [listings, currentUserEmail]);

  // Saved listings for user
  const savedListings = useMemo(() => {
    return listings.filter((item) => savedIds.includes(item.id));
  }, [listings, savedIds]);

  // Tab change handler
  const handleTabChange = (tab: TabType) => {
    setSelectedItem(null);
    setCurrentTab(tab);
  };

  // If not logged in, render LoginGate full-screen
  if (!currentUserEmail) {
    return (
      <>
        <LoginGate onLogin={handleLogin} />
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#041E42] flex flex-col font-sans">
      {/* Fixed top bar shell */}
      <TopBar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        savedCount={savedIds.length}
        userEmail={currentUserEmail}
        userDips={currentUserDips}
        onOpenRewards={() => setRewardsModalOpen(true)}
        isFaculty={isFaculty}
        onSwitchRole={() => {
          if (isFaculty) {
            // Staff -> Student needs no re-verification.
            setCurrentUserEmail('student@fandm.edu');
            addToast('Switched to Student mode');
          } else {
            // Student -> Staff requires signing back in as staff.
            handleSignOut();
          }
        }}
        onSignOut={handleSignOut}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        <AnimatePresence mode="wait">
        <motion.div
          key={selectedItem ? `detail-${selectedItem.id}` : currentTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16, ease: 'easeOut' }}
        >
        {selectedItem ? (
          /* Product Detail View */
          <ProductDetailView
            item={selectedItem}
            allListings={listings}
            isSaved={savedIds.includes(selectedItem.id)}
            onToggleSave={handleToggleSave}
            onBack={() => setSelectedItem(null)}
            onSelectItem={(newItem) => setSelectedItem(newItem)}
          />
        ) : currentTab === 'marketplace' ? (
          <MarketplaceView
            items={marketplaceListings}
            isLoading={isLoading}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onSelectItem={(item) => setSelectedItem(item)}
            sort={sort}
            onSortChange={setSort}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onMinPriceChange={setMinPrice}
            onMaxPriceChange={setMaxPrice}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearFilters={handleClearFilters}
          />
        ) : currentTab === 'food_corner' ? (
          <FoodCornerView
            foodItems={foodItems}
            isFaculty={isFaculty}
            onAddInventory={handleAddFoodInventory}
          />
        ) : currentTab === 'give_and_take' ? (
          <GiveAndTakeView
            gatrItems={gatrListings}
            onSelectItem={(item) => setSelectedItem(item)}
            onOpenDonateGuide={() => setGatrGuideOpen(true)}
          />
        ) : currentTab === 'profile' || currentTab === 'saves' ? (
          <ProfileView
            userEmail={currentUserEmail}
            userDips={currentUserDips}
            isFaculty={isFaculty}
            myListings={userListings}
            savedListings={savedListings}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            onSelectItem={(item) => setSelectedItem(item)}
            onOpenSellModal={() => {
              setEditingItem(null);
              setSellModalOpen(true);
            }}
            onOpenGATRGuide={() => setGatrGuideOpen(true)}
            onOpenRewards={() => setRewardsModalOpen(true)}
            onOpenRewardDiplomats={() => setRewardDiplomatModalOpen(true)}
            onEditItem={(item) => {
              setEditingItem(item);
              setSellModalOpen(true);
            }}
            onToggleStatus={handleToggleItemStatus}
            onDeleteItem={handleDeleteItem}
            initialTab={currentTab === 'saves' ? 'saves' : 'selling'}
          />
        ) : null}
        </motion.div>
        </AnimatePresence>
      </main>

      {/* Post / Edit Item Modal */}
      <PostItemModal
        isOpen={sellModalOpen}
        onClose={() => {
          setSellModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handlePostItem}
        editItem={editingItem}
        userEmail={currentUserEmail}
      />

      {/* GATR Guide Modal */}
      <GATRGuideModal
        isOpen={gatrGuideOpen}
        onClose={() => setGatrGuideOpen(false)}
      />

      {/* Dips Rewards & Redemption View Modal */}
      <RewardsModal
        isOpen={rewardsModalOpen}
        onClose={() => setRewardsModalOpen(false)}
        balance={currentUserDips}
        onRedeem={handleRedeemReward}
      />

      {/* Faculty Reward a Diplomat Modal */}
      <RewardDiplomatModal
        isOpen={rewardDiplomatModalOpen}
        onClose={() => setRewardDiplomatModalOpen(false)}
        onAward={handleAwardDips}
      />

      {/* Toast notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
