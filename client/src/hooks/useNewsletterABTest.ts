import { useState, useEffect } from 'react';

export interface NewsletterVariant {
  id: string;
  title: string;
  subtitle: string;
  bgGradient: string;
  buttonText: string;
  icon: 'gift' | 'mail' | 'sparkles';
}

const VARIANTS: NewsletterVariant[] = [
  {
    id: 'variant_a',
    title: '🎁 Získejte exkluzivní slevy až -80%',
    subtitle: 'Přihlaste se k odběru a buďte první, kdo se dozví o akčních nabídkách',
    bgGradient: 'from-[#E91E63] to-[#FF6B35]',
    buttonText: 'Odebírat',
    icon: 'gift',
  },
  {
    id: 'variant_b',
    title: '✈️ Nenechte si ujít last minute nabídky!',
    subtitle: 'Každý týden nové destinace za neuvěřitelné ceny přímo do emailu',
    bgGradient: 'from-[#003087] to-[#0066CC]',
    buttonText: 'Chci nabídky',
    icon: 'mail',
  },
  {
    id: 'variant_c',
    title: '🔥 Exkluzivní slevy jen pro odběratele',
    subtitle: 'Získejte přístup k nabídkám, které nenajdete nikde jinde',
    bgGradient: 'from-[#FF6B35] to-[#FFA500]',
    buttonText: 'Získat slevy',
    icon: 'sparkles',
  },
];

const STORAGE_KEY = 'newsletter-ab-variant';

export function useNewsletterABTest() {
  const [variant, setVariant] = useState<NewsletterVariant>(VARIANTS[0]);

  useEffect(() => {
    // Check if user already has assigned variant
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      const storedVariant = VARIANTS.find(v => v.id === stored);
      if (storedVariant) {
        setVariant(storedVariant);
        return;
      }
    }

    // Assign random variant for new user
    const randomVariant = VARIANTS[Math.floor(Math.random() * VARIANTS.length)];
    setVariant(randomVariant);
    localStorage.setItem(STORAGE_KEY, randomVariant.id);
  }, []);

  return variant;
}
