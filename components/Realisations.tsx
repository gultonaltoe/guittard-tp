"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Realisation, TypeRealisation } from "@/lib/types";
import Lightbox from "@/components/Lightbox";

const THUMBS_VISIBLE = 3;

export default function Realisations({
  realisations,
  types,
  filtreInitial,
}: {
  realisations: Realisation[];
  types: TypeRealisation[];
  filtreInitial?: string;
}) {
  const filtreInitialValide = types.some((t) => t.slug === filtreInitial)
    ? (filtreInitial as string)
    : "toutes";
  const [filtre, setFiltre] = useState<string>(filtreInitialValide);
  // Une navigation client-side (ex. via le logo/nav du Header, en next/link)
  // change filtreInitial sans démonter ce composant : on resynchronise l'état
  // local pendant le rendu (cf. "Adjusting state when a prop changes" des docs React).
  const [filtreInitialSuivi, setFiltreInitialSuivi] = useState(filtreInitialValide);
  if (filtreInitialValide !== filtreInitialSuivi) {
    setFiltreInitialSuivi(filtreInitialValide);
    setFiltre(filtreInitialValide);
  }
  const [lightbox, setLightbox] = useState<{
    photos: string[];
    index: number;
    titre: string;
  } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  function selectionnerFiltre(slug: string) {
    setFiltre(slug);
    router.replace(slug === "toutes" ? pathname : `${pathname}?type=${slug}`, {
      scroll: false,
    });
  }

  const categoriesPresentes = types.filter(
    (t) => realisations.some((r) => r.categorie === t.slug) || t.slug === filtre
  );

  const visibles =
    filtre === "toutes"
      ? realisations
      : realisations.filter((r) => r.categorie === filtre);

  return (
    <section id="realisations" className="bg-neutral-50 py-10 md:py-20">
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
                onClick={() => selectionnerFiltre("toutes")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  filtre === "toutes"
                    ? "bg-[#464746] text-white"
                    : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:ring-[#e9cc1b]"
                }`}
              >
                Toutes
              </button>
              {categoriesPresentes.map((t) => (
                <button
                  key={t.slug}
                  onClick={() => selectionnerFiltre(t.slug)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                    filtre === t.slug
                      ? "bg-[#464746] text-white"
                      : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:ring-[#e9cc1b]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {visibles.length === 0 && (
              <p className="mt-10 text-sm text-neutral-500">
                Aucune réalisation dans cette catégorie pour le moment.
              </p>
            )}

            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {visibles.map((r) => (
                <article
                  key={r.id}
                  className="overflow-hidden rounded-lg bg-white ring-1 ring-neutral-200"
                >
                  <div className="aspect-video w-full bg-neutral-200">
                    {r.photos[0] ? (
                      <button
                        type="button"
                        onClick={() =>
                          setLightbox({ photos: r.photos, index: 0, titre: r.titre })
                        }
                        className="block h-full w-full"
                        aria-label={`Voir les photos de ${r.titre}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={r.photos[0]}
                          alt={r.titre}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">
                        Photo à venir
                      </div>
                    )}
                  </div>
                  {r.photos.length > 1 && (
                    <div className="flex gap-0.5 bg-white p-0.5">
                      {r.photos.slice(1, 1 + THUMBS_VISIBLE).map((url, i) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() =>
                            setLightbox({ photos: r.photos, index: i + 1, titre: r.titre })
                          }
                          className="relative h-14 w-14 shrink-0 overflow-hidden rounded"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                          {i === THUMBS_VISIBLE - 1 &&
                            r.photos.length > 1 + THUMBS_VISIBLE && (
                              <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                                +{r.photos.length - THUMBS_VISIBLE}
                              </span>
                            )}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#b8901f]">
                      {types.find((t) => t.slug === r.categorie)?.label}
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
      {lightbox && (
        <Lightbox
          photos={lightbox.photos}
          initialIndex={lightbox.index}
          titre={lightbox.titre}
          onClose={() => setLightbox(null)}
        />
      )}
    </section>
  );
}
