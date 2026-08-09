export default function Hero({ telephone }: { telephone: string }) {
  const telHref = `tel:${telephone.replace(/\s+/g, "")}`;
  return (
    <section
      id="accueil"
      className="bg-[#1c1f22] text-white"
    >
      <div className="mx-auto max-w-6xl px-4 py-20">
        <p className="mb-3 inline-block rounded bg-[#f4c430] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#1c1f22]">
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
            className="rounded bg-[#f4c430] px-6 py-3 text-sm font-semibold text-[#1c1f22] hover:brightness-95"
          >
            Contacter
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
