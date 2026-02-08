import { useState, useEffect, useCallback, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

const WISHLIST_KEY = 'akcni-letenky-wishlist';
const SYNC_FLAG_KEY = 'akcni-letenky-wishlist-synced';

export interface WishlistItem {
  id: string;
  addedAt: number; // Unix timestamp
  isFavorite: boolean;
}

// Read from localStorage
function readLocalWishlist(): WishlistItem[] {
  try {
    const stored = localStorage.getItem(WISHLIST_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed) || parsed.length === 0) return [];
    // Handle migration from old string[] format
    if (typeof parsed[0] === 'string') {
      return parsed.map((id: string) => ({
        id,
        addedAt: Date.now(),
        isFavorite: false,
      }));
    }
    return parsed;
  } catch {
    return [];
  }
}

// Write to localStorage
function writeLocalWishlist(items: WishlistItem[]) {
  try {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving wishlist:', e);
  }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<WishlistItem[]>(() => readLocalWishlist());
  const { user } = useAuth();
  const hasSynced = useRef(false);
  const prevUserId = useRef<number | null>(null);

  // tRPC mutations for server sync
  const syncMutation = trpc.wishlist.sync.useMutation();
  const addDestMutation = trpc.wishlist.addDestination.useMutation();
  const removeDestMutation = trpc.wishlist.removeDestination.useMutation();
  const toggleFavMutation = trpc.wishlist.toggleFavorite.useMutation();

  // Fetch server wishlist for logged-in user
  const serverQuery = trpc.wishlist.getDestinations.useQuery(undefined, {
    enabled: !!user,
    staleTime: 30_000,
  });

  // Sync on login: merge localStorage with server DB
  useEffect(() => {
    if (!user) {
      // User logged out - reset sync flag
      hasSynced.current = false;
      prevUserId.current = null;
      return;
    }

    // Only sync once per login session
    if (hasSynced.current && prevUserId.current === user.id) return;

    const localItems = readLocalWishlist();

    // If we have local items, merge with server
    if (localItems.length > 0) {
      syncMutation.mutate(
        { items: localItems },
        {
          onSuccess: (data) => {
            setWishlist(data.items);
            writeLocalWishlist(data.items);
            hasSynced.current = true;
            prevUserId.current = user.id;
            // Mark as synced so we don't re-merge stale local data
            localStorage.setItem(SYNC_FLAG_KEY, String(user.id));
          },
          onError: () => {
            // On error, keep local data
            hasSynced.current = true;
            prevUserId.current = user.id;
          },
        }
      );
    } else if (serverQuery.data) {
      // No local items, use server data
      setWishlist(serverQuery.data);
      writeLocalWishlist(serverQuery.data);
      hasSynced.current = true;
      prevUserId.current = user.id;
    }
  }, [user, serverQuery.data]);

  // When server data loads and we already synced, keep in sync
  useEffect(() => {
    if (!user || !serverQuery.data || !hasSynced.current) return;
    // Only update from server if we're not in the middle of a mutation
    if (!syncMutation.isPending && !addDestMutation.isPending && !removeDestMutation.isPending) {
      setWishlist(serverQuery.data);
      writeLocalWishlist(serverQuery.data);
    }
  }, [serverQuery.data]);

  // Save to localStorage whenever wishlist changes (for guests and as cache)
  useEffect(() => {
    writeLocalWishlist(wishlist);
  }, [wishlist]);

  const toggleWishlist = useCallback((destinationId: string) => {
    setWishlist(prev => {
      const existing = prev.find(item => item.id === destinationId);
      if (existing) {
        // Remove
        const updated = prev.filter(item => item.id !== destinationId);
        if (user) {
          removeDestMutation.mutate(
            { destinationId },
            { onSuccess: () => serverQuery.refetch() }
          );
        }
        return updated;
      } else {
        // Add
        const newItem: WishlistItem = {
          id: destinationId,
          addedAt: Date.now(),
          isFavorite: false,
        };
        if (user) {
          addDestMutation.mutate(
            { destinationId, addedAt: newItem.addedAt, isFavorite: false },
            { onSuccess: () => serverQuery.refetch() }
          );
        }
        return [...prev, newItem];
      }
    });
  }, [user]);

  const toggleFavorite = useCallback((destinationId: string) => {
    setWishlist(prev => {
      const item = prev.find(i => i.id === destinationId);
      if (!item) return prev;
      const newFav = !item.isFavorite;
      if (user) {
        toggleFavMutation.mutate(
          { destinationId, isFavorite: newFav },
          { onSuccess: () => serverQuery.refetch() }
        );
      }
      return prev.map(i =>
        i.id === destinationId ? { ...i, isFavorite: newFav } : i
      );
    });
  }, [user]);

  const isInWishlist = useCallback((destinationId: string) => {
    return wishlist.some(item => item.id === destinationId);
  }, [wishlist]);

  const isFavorite = useCallback((destinationId: string) => {
    const item = wishlist.find(i => i.id === destinationId);
    return item?.isFavorite || false;
  }, [wishlist]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
    // Note: clearWishlist only clears local. Server items remain.
    // If user wants to clear server too, they should remove items individually.
  }, []);

  return {
    wishlist,
    toggleWishlist,
    toggleFavorite,
    isInWishlist,
    isFavorite,
    clearWishlist,
    wishlistCount: wishlist.length,
    isSyncing: syncMutation.isPending,
    isLoggedIn: !!user,
  };
}
