"use client";

import { useState } from "react";
import type { Realisation } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

export default function Realisations({
  realisations,
}: {
  realisations: Realisation[];
}) {
  const [filtre, setFiltre] = useState<string>("toutes");

  const categoriesPresentes = CATEGORIES.filter((c) =>
    realisations.some((r) => r.categorie === c.value)
  );

  const visibles =
    filtre === "toutes"
      ? realisations
      : realisations.filter((r) => r.categorie === filtre);

  return (
    <section id="realisations" className="bg-neutral-50 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-2xl font-bold text-[#464746] sm:text-3xl">
          Nos réalisations
        </h2>
        <p className="mt-2 max-w-2xl text-neutral-600">
          Quelques chantiers récents réalisés dans le Haut-Rhin.
        </p>

        {realisations.length === 0 ? (
          <p className="mt-10 text-sm text-neutral-500">
            Les réalisations seront bientôt publiées ici.
          </p>
        ) : (
          <>
            <div className="mt-8 flex flex-wrap gap-2">
              <button
                onClick={() => setFiltre("toutes")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  filtre === "toutes"
                    ? "bg-[#464746] text-white"
                    : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:ring-[#e9cc1b]"
                }`}
              >
                Toutes
              </button>
              {categoriesPresentes.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setFiltre(c.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    filtre === c.value
                      ? "bg-[#464746] text-white"
                      : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:ring-[#e9cc1b]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibles.map((r) => (
                <article
                  key={r.id}
                  className="overflow-hidden rounded-lg bg-white ring-1 ring-neutral-200"
                >
                  <div className="aspect-video w-full bg-neutral-200">
                    {r.photos[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.photos[0]}
                        alt={r.titre}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                        Photo à venir
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#b8901f]">
                      {CATEGORIES.find((c) => c.value === r.categorie)?.label}
                    </p>
                    <h3 className="mt-1 font-semibold text-[#464746]">
                      {r.titre}
                    </h3>
                    {r.description && (
                      <p className="mt-2 text-sm text-neutral-600">
                        {r.description}
                      </p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
