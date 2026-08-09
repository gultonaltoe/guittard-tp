import Logo from "./Logo";
import type { SiteSettings } from "@/lib/types";

export default function Footer({ settings }: { settings: SiteSettings }) {
  const telHref = `tel:${settings.telephone.replace(/\s+/g, "")}`;
  return (
    <footer className="border-t border-neutral-200 bg-white py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-4 sm:flex-row sm:items-center">
        <div>
          <Logo />
          <p className="mt-2 text-sm text-neutral-500">{settings.adresse}</p>
          <p className="text-sm text-neutral-500">
            {settings.telephone} · {settings.email}
          </p>
        </div>
        <nav className="flex gap-4 text-sm text-neutral-600">
          <a href="#prestations" className="hover:text-[#1c1f22]">
            Prestations
          </a>
          <a href="#realisations" className="hover:text-[#1c1f22]">
            Réalisations
          </a>
          <a href="#contact" className="hover:text-[#1c1f22]">
            Contact
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-6 max-w-6xl px-4 text-xs text-neutral-400">
        © {new Date().getFullYear()} Guittard TP &amp; Terrassement. Tous
        droits réservés.
      </p>
      <a
        href={telHref}
        className="fixed bottom-4 right-4 z-40 rounded-full bg-[#f4c430] px-5 py-3 text-sm font-semibold text-[#1c1f22] shadow-lg sm:hidden"
      >
        Appeler · {settings.telephone}
      </a>
    </footer>
  );
}
