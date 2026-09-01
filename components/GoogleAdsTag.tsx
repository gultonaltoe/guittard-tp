"use client";

import Script from "next/script";
import { useSyncExternalStore } from "react";
import { getStoredConsent, subscribeToConsent } from "@/lib/cookieConsent";

// À renseigner dans les variables d'environnement (ex: "AW-XXXXXXXXX") une fois
// le compte Google Ads finalisé -- voir README.md pour la procédure complète.
// Tant que la variable est vide, ce composant ne charge aucun script.
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

function hasAcceptedConsent() {
  return getStoredConsent() === "accepted";
}

function hasAcceptedConsentServerSnapshot() {
  return false;
}

export default function GoogleAdsTag() {
  const consented = useSyncExternalStore(
    subscribeToConsent,
    hasAcceptedConsent,
    hasAcceptedConsentServerSnapshot
  );

  if (!GOOGLE_ADS_ID || !consented) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
    </>
  );
}
