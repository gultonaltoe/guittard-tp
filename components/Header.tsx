import Image from "next/image";
import Link from "next/link";

export default function Header({ telephone }: { telephone: string }) {
  const telHref = `tel:${telephone.replace(/\s+/g, "")}`;
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="#accueil" className="flex items-center gap-3 leading-none">
          <Image
            src="/logo-guittard-badge.png"
            alt=""
            aria-hidden="true"
            width={48}
            height={48}
            priority
          />
          <span className="whitespace-nowrap text-[15px] font-bold leading-none tracking-wide text-[#464746]">
            GUITTARD TP &amp; TERRASSEMENT
          </span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium leading-none text-neutral-700 md:flex">
          <Link href="#prestations" className="leading-none hover:text-[#464746]">
            Prestations
          </Link>
          <Link href="#realisations" className="leading-none hover:text-[#464746]">
            Réalisations
          </Link>
          <Link href="#contact" className="leading-none hover:text-[#464746]">
            Contact
          </Link>
        </nav>
        <a
          href={telHref}
          className="rounded bg-[#e9cc1b] px-4 py-2 text-sm font-semibold leading-none text-[#464746] hover:bg-[#d8bd18]"
        >
          {telephone}
        </a>
      </div>
    </header>
  );
}
