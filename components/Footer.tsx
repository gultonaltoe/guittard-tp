"use client";

import Image from "next/image";
import Link from "next/link";
import type { SiteSettings } from "@/lib/types";
import { openCookiePreferences } from "@/lib/cookieConsent";

export default function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="bg-[#464746] py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-start">
        <div>
          <Image
            src="/logo-guittard-light.png"
            alt="Guittard TP & Terrassement"
            width={140}
            height={40}
            style={{ width: "140px", height: "auto" }}
          />
          <p className="mt-2 text-sm text-[#e9cc1b]">{settings.adresse}</p>
          <p className="text-sm text-[#e9cc1b]">
            {settings.telephone} · {settings.email}
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-white">
          <Link href="/#prestations" className="hover:text-[#e9cc1b]">
            Prestations
          </Link>
          <Link href="/#realisations" className="hover:text-[#e9cc1b]">
            Réalisations
          </Link>
          <Link href="/#contact" className="hover:text-[#e9cc1b]">
            Contact
          </Link>
          <Link href="/mentions-legales" className="hover:text-[#e9cc1b]">
            Mentions légales
          </Link>
          <Link href="/politique-confidentialite" className="hover:text-[#e9cc1b]">
            Politique de confidentialité
          </Link>
          <button
            type="button"
            onClick={openCookiePreferences}
            className="underline-offset-2 hover:text-[#e9cc1b] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9cc1b]"
          >
            Gérer mes cookies
          </button>
        </nav>
      </div>
      <p className="mx-auto mt-6 max-w-6xl px-4 text-xs text-neutral-300">
        © {new Date().getFullYear()} Guittard TP &amp; Terrassement. Tous
        droits réservés.
      </p>
    </footer>
  );
}
