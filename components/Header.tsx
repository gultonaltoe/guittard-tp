import Link from "next/link";
import Logo from "./Logo";

export default function Header({ telephone }: { telephone: string }) {
  const telHref = `tel:${telephone.replace(/\s+/g, "")}`;
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="#accueil">
          <Logo />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-700 md:flex">
          <Link href="#prestations" className="hover:text-[#1c1f22]">
            Prestations
          </Link>
          <Link href="#realisations" className="hover:text-[#1c1f22]">
            Réalisations
          </Link>
          <Link href="#contact" className="hover:text-[#1c1f22]">
            Contact
          </Link>
        </nav>
        <a
          href={telHref}
          className="rounded bg-[#1c1f22] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2a2e33]"
        >
          {telephone}
        </a>
      </div>
    </header>
  );
}
