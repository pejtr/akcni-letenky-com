/**
 * Social Proof A/B Test System
 * 
 * Tests different positions and frequencies for social proof notifications
 * to maximize CTR and conversions
 */

// A/B Test Variants
export interface SocialProofVariant {
  id: string;
  name: string;
  position: 'left' | 'right';
  initialDelay: number; // ms before first notification
  minInterval: number; // ms minimum between notifications
  maxInterval: number; // ms maximum between notifications
  displayDuration: number; // ms how long notification shows
}

// All variants now use LEFT position to avoid overlap with chatbot on RIGHT
export const SOCIAL_PROOF_VARIANTS: SocialProofVariant[] = [
  {
    id: 'A',
    name: 'Vlevo - Standardní frekvence',
    position: 'left',
    initialDelay: 5000,
    minInterval: 15000,
    maxInterval: 25000,
    displayDuration: 8000,
  },
  {
    id: 'B',
    name: 'Vlevo - Delší zobrazení',
    position: 'left',
    initialDelay: 5000,
    minInterval: 20000,
    maxInterval: 35000,
    displayDuration: 10000,
  },
  {
    id: 'C',
    name: 'Vlevo - Vyšší frekvence',
    position: 'left',
    initialDelay: 3000,
    minInterval: 10000,
    maxInterval: 20000,
    displayDuration: 6000,
  },
  {
    id: 'D',
    name: 'Vlevo - Nízká frekvence',
    position: 'left',
    initialDelay: 8000,
    minInterval: 25000,
    maxInterval: 45000,
    displayDuration: 12000,
  },
];

const STORAGE_KEY = 'social_proof_ab_variant';
const IMPRESSIONS_KEY = 'social_proof_impressions';
const CLICKS_KEY = 'social_proof_clicks';
const SESSION_COUNT_KEY = 'social_proof_session_count';
export const MAX_NOTIFICATIONS_PER_SESSION = 3;

export function canShowNotification(): boolean {
  if (typeof window === 'undefined') return true;
  const count = parseInt(sessionStorage.getItem(SESSION_COUNT_KEY) || '0', 10);
  return count < MAX_NOTIFICATIONS_PER_SESSION;
}

export function incrementNotificationCount(): void {
  if (typeof window === 'undefined') return;
  const count = parseInt(sessionStorage.getItem(SESSION_COUNT_KEY) || '0', 10);
  sessionStorage.setItem(SESSION_COUNT_KEY, String(count + 1));
}

// Get or assign variant for this user
export function getAssignedVariant(): SocialProofVariant {
  if (typeof window === 'undefined') {
    return SOCIAL_PROOF_VARIANTS[0];
  }

  // Check if user already has assigned variant
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    const variant = SOCIAL_PROOF_VARIANTS.find(v => v.id === stored);
    if (variant) return variant;
  }

  // Randomly assign variant (equal distribution)
  const randomIndex = Math.floor(Math.random() * SOCIAL_PROOF_VARIANTS.length);
  const variant = SOCIAL_PROOF_VARIANTS[randomIndex];
  localStorage.setItem(STORAGE_KEY, variant.id);
  
  return variant;
}

// Track impression (notification shown)
export function trackImpression(variantId: string): void {
  if (typeof window === 'undefined') return;
  
  const key = `${IMPRESSIONS_KEY}_${variantId}`;
  const current = parseInt(localStorage.getItem(key) || '0', 10);
  localStorage.setItem(key, String(current + 1));
}

// Track click on notification
export function trackClick(variantId: string): void {
  if (typeof window === 'undefined') return;
  
  const key = `${CLICKS_KEY}_${variantId}`;
  const current = parseInt(localStorage.getItem(key) || '0', 10);
  localStorage.setItem(key, String(current + 1));
}

// Get stats for all variants
export function getVariantStats(): Array<{
  variant: SocialProofVariant;
  impressions: number;
  clicks: number;
  ctr: number;
}> {
  if (typeof window === 'undefined') return [];
  
  return SOCIAL_PROOF_VARIANTS.map(variant => {
    const impressions = parseInt(localStorage.getItem(`${IMPRESSIONS_KEY}_${variant.id}`) || '0', 10);
    const clicks = parseInt(localStorage.getItem(`${CLICKS_KEY}_${variant.id}`) || '0', 10);
    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    
    return {
      variant,
      impressions,
      clicks,
      ctr,
    };
  });
}

// Get position classes based on variant
// Using bottom-24 to avoid overlap with bottom yellow panel
export function getPositionClasses(variant: SocialProofVariant): string {
  if (variant.position === 'left') {
    return 'fixed bottom-24 left-6 z-[60] space-y-3 max-w-sm';
  }
  return 'fixed bottom-24 right-6 z-[60] space-y-3 max-w-sm';
}

// Get animation classes based on position
export function getAnimationClasses(variant: SocialProofVariant): string {
  if (variant.position === 'left') {
    return 'animate-in slide-in-from-left duration-500';
  }
  return 'animate-in slide-in-from-right duration-500';
}
