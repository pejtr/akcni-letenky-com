export const CONSENT_STORAGE_KEY = "gdpr_consent";
export const CONSENT_CHANGED_EVENT = "akcni:consent-changed";
export const OPEN_CONSENT_EVENT = "akcni:open-consent";

export interface ConsentPreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
  version: 1;
}

export function readConsent(): ConsentPreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentPreferences>;
    if (parsed.necessary !== true) return null;
    return {
      necessary: true,
      analytics: parsed.analytics === true,
      marketing: parsed.marketing === true,
      timestamp: typeof parsed.timestamp === "number" ? parsed.timestamp : 0,
      version: 1,
    };
  } catch {
    return null;
  }
}

export function saveConsent(input: Pick<ConsentPreferences, "analytics" | "marketing">): ConsentPreferences {
  const preferences: ConsentPreferences = {
    necessary: true,
    analytics: input.analytics,
    marketing: input.marketing,
    timestamp: Date.now(),
    version: 1,
  };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(preferences));
    window.dispatchEvent(new CustomEvent<ConsentPreferences>(CONSENT_CHANGED_EVENT, { detail: preferences }));
  }
  return preferences;
}

export function hasAnalyticsConsent(): boolean {
  return readConsent()?.analytics === true;
}

export function hasMarketingConsent(): boolean {
  return readConsent()?.marketing === true;
}

export function subscribeConsent(listener: (preferences: ConsentPreferences | null) => void): () => void {
  if (typeof window === "undefined") return () => {};
  const handler = (event: Event) => {
    const custom = event as CustomEvent<ConsentPreferences>;
    listener(custom.detail ?? readConsent());
  };
  window.addEventListener(CONSENT_CHANGED_EVENT, handler);
  return () => window.removeEventListener(CONSENT_CHANGED_EVENT, handler);
}

export function openConsentSettings() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}
