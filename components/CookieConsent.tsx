"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  OPEN_COOKIE_PREFERENCES_EVENT,
  getStoredConsent,
  setStoredConsent,
  subscribeToConsent,
  type CookieConsentStatus,
} from "@/lib/cookieConsent";

function hasStoredConsent() {
  return getStoredConsent() !== null;
}

// Sur le serveur, on ne connaît pas le choix déjà fait par ce visiteur : on
// suppose "déjà répondu" pour ne pas afficher le bandeau dans le HTML initial,
// useSyncExternalStore corrige ensuite côté client sans avertissement d'hydratation.
function hasStoredConsentServerSnapshot() {
  return true;
}

export default function CookieConsent() {
  const hasConsent = useSyncExternalStore(
    subscribeToConsent,
    hasStoredConsent,
    hasStoredConsentServerSnapshot
  );
  const [forceOpen, setForceOpen] = useState(false);

  useEffect(() => {
    function handleOpen() {
      setForceOpen(true);
    }
    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpen);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleOpen);
  }, []);

  const visible = !hasConsent || forceOpen;
  if (!visible) return null;

  function choose(status: CookieConsentStatus) {
    setStoredConsent(status);
    setForceOpen(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#464746] px-4 py-5 shadow-[0_-4px_16px_rgba(0,0,0,0.25)]"
    >
      <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p id="cookie-consent-title" className="max-w-2xl text-sm text-white">
          Nous utilisons un cookie de mesure publicitaire (Google Ads) pour évaluer
          l&apos;efficacité de nos campagnes. Ce cookie n&apos;est déposé qu&apos;avec votre
          accord.{" "}
          <Link
            href="/politique-confidentialite"
            className="underline hover:text-[#e9cc1b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9cc1b]"
          >
            En savoir plus
          </Link>
        </p>
        <div className="flex w-full shrink-0 gap-3 sm:w-auto">
          <button
            type="button"
            onClick={() => choose("refused")}
            className="min-h-[44px] flex-1 rounded border-2 border-white px-6 py-2 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex-none"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => choose("accepted")}
            className="min-h-[44px] flex-1 rounded border-2 border-[#e9cc1b] bg-[#e9cc1b] px-6 py-2 text-sm font-semibold text-[#464746] hover:bg-[#d8bd18] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:flex-none"
          >
            Accepter
          </button>
        </div>
      </div>
    </div>
  );
}
