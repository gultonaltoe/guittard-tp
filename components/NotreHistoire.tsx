import Image from "next/image";

export default function NotreHistoire({
  titre,
  contenu,
  ctaTexte,
  ctaSurligne,
}: {
  titre: string;
  contenu: string;
  ctaTexte: string;
  ctaSurligne: string;
}) {
  const paragraphes = contenu
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="bg-[#faf9f5] px-4 py-10 md:py-16">
      <div className="mx-auto max-w-5xl text-center">
        <p className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#464746]">
          <span className="h-2 w-2 shrink-0 bg-[#e9cc1b]" aria-hidden="true" />
          Notre histoire
        </p>
        <h2 className="mx-auto mt-4 max-w-4xl text-xl font-bold italic leading-snug text-[#464746] sm:text-2xl lg:whitespace-nowrap lg:text-3xl">
          {titre}
        </h2>
        <div className="mx-auto mt-6 flex max-w-2xl flex-col gap-4">
          {paragraphes.map((paragraphe, i) => (
            <p key={i} className="text-lg leading-[1.75] text-[#464746]">
              {paragraphe}
            </p>
          ))}
        </div>
        <div className="mx-auto mt-6 h-[3px] w-[60px] bg-[#e9cc1b]" aria-hidden="true" />
        <p className="mt-4 text-lg font-bold italic text-[#464746]">
          {ctaTexte} <span className="bg-[#e9cc1b] px-2 py-0.5">{ctaSurligne}</span>
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Image
            src="/logo-guittard-badge.png"
            alt=""
            aria-hidden="true"
            width={42}
            height={42}
          />
          <div className="text-left">
            <p className="font-bold italic text-[#464746]">Vincent Guittard</p>
            <p className="text-xs text-neutral-500">Fondateur</p>
          </div>
        </div>
      </div>
    </div>
  );
}
