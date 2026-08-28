import type { Partner } from "@/lib/types";

export default function Partenaires({ partners }: { partners: Partner[] }) {
  return (
    <section id="partenaires" className="mx-auto max-w-6xl px-4 py-10 md:py-20">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#464746]">
        <span className="h-[3px] w-4 bg-[#e9cc1b]" aria-hidden="true" />
        Nos partenaires locaux
      </p>
      <h2 className="mt-2 max-w-2xl text-2xl font-bold text-[#464746] sm:text-3xl">
        Ils nous accompagnent sur nos chantiers
      </h2>
      <p className="mt-2 max-w-2xl text-neutral-600">
        Fournisseurs de matériaux, sous-traitants et acteurs locaux avec qui nous travaillons dans
        le Haut-Rhin.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:mt-10 md:grid-cols-6">
        {partners.map((p) => {
          const content = (
            <>
              <div className="flex h-16 w-full items-center justify-center">
                {p.logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.logo}
                    alt={p.name}
                    loading="lazy"
                    className="max-h-16 max-w-full object-contain"
                  />
                ) : (
                  <span className="text-sm font-semibold text-[#464746]">{p.name}</span>
                )}
              </div>
              <p className="mt-3 text-center text-xs font-medium text-neutral-500">{p.name}</p>
            </>
          );
          const className =
            "flex min-h-[44px] flex-col justify-center rounded-lg border border-neutral-200 bg-white p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-[#e9cc1b] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e9cc1b] focus-visible:ring-offset-2";

          return p.website_url ? (
            <a
              key={p.id}
              href={p.website_url}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              {content}
            </a>
          ) : (
            <div key={p.id} className={className}>
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
