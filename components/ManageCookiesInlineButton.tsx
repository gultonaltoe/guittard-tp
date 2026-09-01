"use client";

import { openCookiePreferences } from "@/lib/cookieConsent";

export default function ManageCookiesInlineButton() {
  return (
    <button
      type="button"
      onClick={openCookiePreferences}
      className="underline hover:text-[#464746] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#464746]"
    >
      « Gérer mes cookies »
    </button>
  );
}
