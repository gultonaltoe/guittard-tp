"use client";

import { useState } from "react";
import type { Review, TypeRealisation } from "@/lib/types";
import AvisCard from "./AvisCard";

const PAGE_SIZE = 9;

export default function AvisListe({
  reviews,
  types,
}: {
  reviews: Review[];
  types: TypeRealisation[];
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);
  const affiches = reviews.slice(0, visible);

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {affiches.map((r) => (
          <AvisCard key={r.id} review={r} types={types} />
        ))}
      </div>
      {visible < reviews.length && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="flex min-h-[44px] items-center rounded border border-neutral-300 px-6 py-3 text-sm font-semibold text-[#464746] hover:border-[#464746]"
          >
            Charger plus d&apos;avis
          </button>
        </div>
      )}
    </>
  );
}
