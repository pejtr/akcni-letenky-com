import { useState, useEffect } from 'react';

const WISHLIST_KEY = 'akcni-letenky-wishlist';

export interface WishlistItem {
  id: string;
  addedAt: number; // Unix timestamp
  isFavorite: boolean;
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Handle migration from old string[] format to new WishlistItem[] format
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (typeof parsed[0] === 'string') {
            // Migrate old format
            const migrated: WishlistItem[] = parsed.map((id: string) => ({
              id,
              addedAt: Date.now(),
              isFavorite: false,
            }));
            setWishlist(migrated);
          } else {
            setWishlist(parsed);
          }
        }
      }
    } catch (e) {
      console.error('Error loading wishlist:', e);
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (e) {
      console.error('Error saving wishlist:', e);
    }
  }, [wishlist]);

  const toggleWishlist = (destinationId: string) => {
    setWishlist(prev => {
      const existing = prev.find(item => item.id === destinationId);
      if (existing) {
        return prev.filter(item => item.id !== destinationId);
      } else {
        return [...prev, {
          id: destinationId,
          addedAt: Date.now(),
          isFavorite: false,
        }];
      }
    });
  };

  const toggleFavorite = (destinationId: string) => {
    setWishlist(prev =>
      prev.map(item =>
        item.id === destinationId
          ? { ...item, isFavorite: !item.isFavorite }
          : item
      )
    );
  };

  const isInWishlist = (destinationId: string) => {
    return wishlist.some(item => item.id === destinationId);
  };

  const isFavorite = (destinationId: string) => {
    const item = wishlist.find(item => item.id === destinationId);
    return item?.isFavorite || false;
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  return {
    wishlist,
    toggleWishlist,
    toggleFavorite,
    isInWishlist,
    isFavorite,
    clearWishlist,
    wishlistCount: wishlist.length,
  };
}
