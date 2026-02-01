/**
 * Hook for tracking viewed destinations and personalizing offers
 * 
 * Stores viewed destinations in localStorage and provides
 * personalized recommendations based on browsing history
 */

import { useState, useEffect } from "react";

export interface ViewedDestination {
  slug: string;
  name: string;
  price?: number;
  viewedAt: number;
}

interface PersonalizedOffer {
  destination: string;
  price: number;
  originalPrice: number;
  discount: string;
  image: string;
  slug: string;
}

const STORAGE_KEY = "viewed_destinations";
const MAX_STORED = 10;
const EXPIRY_DAYS = 7;

export function useViewedDestinations() {
  const [viewedDestinations, setViewedDestinations] = useState<ViewedDestination[]>([]);

  // Load viewed destinations from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as ViewedDestination[];
        
        // Filter out expired entries (older than EXPIRY_DAYS)
        const now = Date.now();
        const expiryTime = EXPIRY_DAYS * 24 * 60 * 60 * 1000;
        const valid = parsed.filter(d => now - d.viewedAt < expiryTime);
        
        setViewedDestinations(valid);
        
        // Update storage if we filtered anything out
        if (valid.length !== parsed.length) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
        }
      }
    } catch (error) {
      console.error("Failed to load viewed destinations:", error);
    }
  }, []);

  // Track a new destination view
  const trackDestinationView = (slug: string, name: string, price?: number) => {
    try {
      const newView: ViewedDestination = {
        slug,
        name,
        price,
        viewedAt: Date.now(),
      };

      setViewedDestinations(prev => {
        // Remove duplicate if exists
        const filtered = prev.filter(d => d.slug !== slug);
        
        // Add new view at the beginning
        const updated = [newView, ...filtered].slice(0, MAX_STORED);
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        
        return updated;
      });
    } catch (error) {
      console.error("Failed to track destination view:", error);
    }
  };

  // Get personalized offers based on viewed destinations
  const getPersonalizedOffers = (): PersonalizedOffer[] => {
    // Default offers if no browsing history
    const defaultOffers: PersonalizedOffer[] = [
      { 
        destination: "Paříž", 
        price: 1027, 
        originalPrice: 1500, 
        discount: "-32%", 
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&h=300&fit=crop",
        slug: "pariz"
      },
      { 
        destination: "Barcelona", 
        price: 746, 
        originalPrice: 1100, 
        discount: "-32%", 
        image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400&h=300&fit=crop",
        slug: "barcelona"
      },
      { 
        destination: "Londýn", 
        price: 733, 
        originalPrice: 1000, 
        discount: "-27%", 
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop",
        slug: "londyn"
      },
    ];

    // If user has viewed destinations, show similar offers
    if (viewedDestinations.length > 0) {
      const recentViews = viewedDestinations.slice(0, 3);
      
      return recentViews.map(view => {
        // Calculate personalized discount (10-40%)
        const basePrice = view.price || 1000;
        const discountPercent = 20 + Math.floor(Math.random() * 20); // 20-40%
        const discountedPrice = Math.floor(basePrice * (1 - discountPercent / 100));
        
        return {
          destination: view.name,
          price: discountedPrice,
          originalPrice: basePrice,
          discount: `-${discountPercent}%`,
          image: `https://images.unsplash.com/photo-1${Math.floor(Math.random() * 1000000000)}?w=400&h=300&fit=crop&q=80`,
          slug: view.slug,
        };
      });
    }

    return defaultOffers;
  };

  // Get personalized message based on browsing history
  const getPersonalizedMessage = (): string => {
    if (viewedDestinations.length === 0) {
      return "Získejte exkluzivní slevu až 60% na vybrané destinace";
    }

    const recentDestination = viewedDestinations[0].name;
    
    if (viewedDestinations.length === 1) {
      return `Zajímá vás ${recentDestination}? Máme pro vás speciální nabídku!`;
    }

    return `Viděli jsme, že se zajímáte o ${recentDestination} a další destinace. Máme pro vás slevy až 60%!`;
  };

  return {
    viewedDestinations,
    trackDestinationView,
    getPersonalizedOffers,
    getPersonalizedMessage,
  };
}
