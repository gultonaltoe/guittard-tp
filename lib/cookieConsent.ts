export type CookieConsentStatus = "accepted" | "refused";

const STORAGE_KEY = "guittardtp_cookie_consent";

// Émis sur `window` à chaque changement de consentement (accepté/refusé),
// pour que le bandeau et le tag Google Ads restent synchronisés sans state partagé.
export const COOKIE_CONSENT_EVENT = "guittardtp:cookie-consent-changed";

// Émis par le bouton "Gérer mes cookies" du footer pour rouvrir le bandeau.
export const OPEN_COOKIE_PREFERENCES_EVENT = "guittardtp:open-cookie-preferences";

export function getStoredConsent(): CookieConsentStatus | null {
  if (typeof window === "undefined") return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value === "accepted" || value === "refused" ? value : null;
}

export function setStoredConsent(status: CookieConsentStatus) {
  window.localStorage.setItem(STORAGE_KEY, status);
  window.dispatchEvent(
    new CustomEvent<CookieConsentStatus>(COOKIE_CONSENT_EVENT, { detail: status })
  );
}

export function openCookiePreferences() {
  window.dispatchEvent(new Event(OPEN_COOKIE_PREFERENCES_EVENT));
}

export function subscribeToConsent(callback: () => void): () => void {
  window.addEventListener(COOKIE_CONSENT_EVENT, callback);
  return () => window.removeEventListener(COOKIE_CONSENT_EVENT, callback);
}
