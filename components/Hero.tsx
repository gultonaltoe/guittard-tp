import Image from "next/image";

export default function Hero({ telephone }: { telephone: string }) {
  const telHref = `tel:${telephone.replace(/\s+/g, "")}`;
  return (
    <section
      id="accueil"
      className="relative overflow-hidden bg-[#464746] text-white"
    >
      <Image
        src="/logo-icone.png"
        alt=""
        aria-hidden="true"
        width={721}
        height={334}
        className="pointer-events-none absolute right-0 top-1/2 hidden h-auto w-[560px] -translate-y-1/2 opacity-[0.22] md:block"
      />
      <div className="relative mx-auto max-w-6xl px-4 py-10 md:py-20">
        <p className="mb-3 inline-block rounded bg-[#e9cc1b] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#464746]">
          Terrassement &amp; Travaux Publics dans le Haut-Rhin
        </p>
        <h1 className="max-w-3xl text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
          Terrassement, VRD et aménagements extérieurs pour particuliers et
          professionnels
        </h1>
        <p className="mt-4 max-w-xl text-neutral-300">
          Interventions dans le Haut-Rhin &amp; alentours.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href="#contact"
            className="rounded bg-[#e9cc1b] px-6 py-3 text-sm font-semibold text-[#464746] hover:brightness-95"
          >
            Nous contacter
          </a>
          <a
            href={telHref}
            className="rounded border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            {telephone}
          </a>
        </div>
      </div>
    </section>
  );
}
