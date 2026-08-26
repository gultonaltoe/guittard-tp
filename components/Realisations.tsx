"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Realisation, TypeRealisation } from "@/lib/types";
import Lightbox from "@/components/Lightbox";

const THUMBS_VISIBLE = 3;
const MOSAIQUE_TAILLE = 6;

// Spans desktop (grille 6 colonnes) : la première tuile est la grande vedette,
// les suivantes se répartissent en 2 colonnes autour, cf. maquette validée le 26/08/2026.
const SPANS_MOSAIQUE = [
  "md:col-span-4 md:row-span-2",
  "md:col-span-2 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-2 md:row-span-1",
  "md:col-span-2 md:row-span-1",
];

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
  const [filtreInitialSuivi, setFiltreInitialSuivi] =
    useState(filtreInitialValide);
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
  const grilleRef = useRef<HTMLDivElement>(null);

  function selectionnerFiltre(slug: string) {
    setFiltre(slug);
    router.replace(slug === "toutes" ? pathname : `${pathname}?type=${slug}`, {
      scroll: false,
    });
  }

  function selectionnerFiltreDepuisTuile(slug: string) {
    selectionnerFiltre(slug);
    grilleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const categoriesPresentes = types.filter(
    (t) =>
      realisations.some((r) => r.categorie === t.slug) || t.slug === filtre,
  );

  const tuilesMosaique = realisations
    .filter((r) => r.photos[0])
    .slice(0, MOSAIQUE_TAILLE);

  // Vue "Toutes" : la mosaïque sert déjà de vue d'ensemble, la grille classique
  // n'affiche que le reste pour éviter de montrer deux fois les mêmes chantiers.
  const idsMosaique = new Set(tuilesMosaique.map((r) => r.id));
  const visibles =
    filtre === "toutes"
      ? realisations.filter((r) => !idsMosaique.has(r.id))
      : realisations.filter((r) => r.categorie === filtre);

  return (
    <section id="realisations" className="bg-[#464746] py-10 md:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#e9cc1b]">
            Réalisations
          </p>
          <h2 className="mt-2 max-w-2xl text-2xl font-bold text-white sm:text-3xl">
            Terrassement, VRD et aménagements extérieurs — en images
          </h2>
        </div>

        {realisations.length === 0 ? (
          <p className="mt-10 text-sm text-neutral-300">
            Les réalisations seront bientôt publiées ici.
          </p>
        ) : (
          <>
            <div className="mt-6 flex flex-wrap gap-2">
              <button
                onClick={() => selectionnerFiltre("toutes")}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  filtre === "toutes"
                    ? "bg-[#e9cc1b] text-[#464746]"
                    : "bg-white/10 text-white ring-1 ring-white/20 hover:ring-[#e9cc1b]"
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
                      ? "bg-[#e9cc1b] text-[#464746]"
                      : "bg-white/10 text-white ring-1 ring-white/20 hover:ring-[#e9cc1b]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {tuilesMosaique.length > 0 && (
              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-6 md:auto-rows-[160px] lg:auto-rows-[180px]">
                {tuilesMosaique.map((r, i) => {
                  const typeLabel = types.find(
                    (t) => t.slug === r.categorie,
                  )?.label;
                  const grande = i === 0;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => selectionnerFiltreDepuisTuile(r.categorie)}
                      aria-label={`Voir les réalisations ${typeLabel ?? ""} — ${r.titre}`}
                      className={`group relative overflow-hidden rounded-sm ring-1 ring-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e9cc1b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#464746] md:h-auto ${
                        grande ? "h-72" : "h-48"
                      } ${
                        tuilesMosaique.length === 1
                          ? "md:col-span-6 md:row-span-2"
                          : SPANS_MOSAIQUE[i]
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={r.photos[0]}
                        alt={`${r.titre}${typeLabel ? ` — ${typeLabel}` : ""}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                        <h3 className="text-sm font-bold italic text-white drop-shadow-sm sm:text-base">
                          {r.titre}
                        </h3>
                        {typeLabel && (
                          <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#e9cc1b]">
                            {typeLabel}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <div ref={grilleRef} className="mt-12 scroll-mt-24">
              {filtre !== "toutes" && visibles.length === 0 && (
                <p className="text-sm text-neutral-300">
                  Aucune réalisation dans cette catégorie pour le moment.
                </p>
              )}

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibles.map((r) => {
                  const typeLabel = types.find(
                    (t) => t.slug === r.categorie,
                  )?.label;
                  return (
                    <article
                      key={r.id}
                      className="overflow-hidden rounded-sm bg-white/5 ring-1 ring-white/10"
                    >
                      <div className="relative aspect-video w-full bg-white/5">
                        {r.photos[0] ? (
                          <button
                            type="button"
                            onClick={() =>
                              setLightbox({
                                photos: r.photos,
                                index: 0,
                                titre: r.titre,
                              })
                            }
                            aria-label={`Voir les photos de ${r.titre}`}
                            className="group block h-full w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e9cc1b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#464746]"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={r.photos[0]}
                              alt={r.titre}
                              loading="lazy"
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-4 text-left">
                              <h3 className="text-sm font-bold italic text-white drop-shadow-sm sm:text-base">
                                {r.titre}
                              </h3>
                              {typeLabel && (
                                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#e9cc1b]">
                                  {typeLabel}
                                </p>
                              )}
                            </div>
                          </button>
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center gap-1 p-4 text-center">
                            <p className="text-xs text-white/40">
                              Photo à venir
                            </p>
                            <h3 className="text-sm font-bold italic text-white">
                              {r.titre}
                            </h3>
                          </div>
                        )}
                      </div>
                      {r.photos.length > 1 && (
                        <div className="flex gap-0.5 bg-black/20 p-0.5">
                          {r.photos
                            .slice(1, 1 + THUMBS_VISIBLE)
                            .map((url, i) => (
                              <button
                                key={url}
                                type="button"
                                onClick={() =>
                                  setLightbox({
                                    photos: r.photos,
                                    index: i + 1,
                                    titre: r.titre,
                                  })
                                }
                                className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e9cc1b]"
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
                      {r.description && (
                        <p className="px-4 py-3 text-sm text-neutral-300">
                          {r.description}
                        </p>
                      )}
                    </article>
                  );
                })}
              </div>
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
