import Image from "next/image";
import type { SiteSettings } from "@/lib/types";

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
        <nav className="flex gap-4 text-sm text-white">
          <a href="#prestations" className="hover:text-[#e9cc1b]">
            Prestations
          </a>
          <a href="#realisations" className="hover:text-[#e9cc1b]">
            Réalisations
          </a>
          <a href="#contact" className="hover:text-[#e9cc1b]">
            Contact
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-6 max-w-6xl px-4 text-xs text-neutral-300">
        © {new Date().getFullYear()} Guittard TP &amp; Terrassement. Tous
        droits réservés.
      </p>
    </footer>
  );
}
