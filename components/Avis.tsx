import Link from "next/link";
import type { Review, TypeRealisation } from "@/lib/types";
import { computeAverageRating } from "@/lib/reviews";
import StarRating from "./StarRating";
import AvisCard from "./AvisCard";

const APERCU_TAILLE = 3;

export default function Avis({
  reviews,
  types,
}: {
  reviews: Review[];
  types: TypeRealisation[];
}) {
  const { average, count } = computeAverageRating(reviews);
  const recentes = reviews.slice(0, APERCU_TAILLE);

  return (
    <section id="avis" className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#464746]">
            <span className="h-[3px] w-4 bg-[#e9cc1b]" aria-hidden="true" />
            Avis clients
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#464746] sm:text-3xl">
            Ce que nos clients disent de nos chantiers
          </h2>
          <p className="mt-2 text-neutral-600">
            Les retours de nos clients sur nos chantiers de terrassement, VRD et aménagements
            extérieurs dans le Haut-Rhin.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#464746]">
              {average.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </span>
            <span className="text-sm text-neutral-500">/ 5</span>
          </div>
          <StarRating rating={Math.round(average)} />
          <span className="text-xs text-neutral-500">
            {count} avis
          </span>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {recentes.map((r) => (
          <AvisCard key={r.id} review={r} types={types} />
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Link
          href="/avis"
          className="flex min-h-[44px] items-center rounded border border-neutral-300 px-6 py-3 text-sm font-semibold text-[#464746] hover:border-[#464746]"
        >
          Voir tous les avis
        </Link>
      </div>
    </section>
  );
}
