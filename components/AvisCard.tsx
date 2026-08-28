import type { Review, TypeRealisation } from "@/lib/types";
import StarRating from "./StarRating";

export default function AvisCard({
  review,
  types,
}: {
  review: Review;
  types: TypeRealisation[];
}) {
  const typeLabel = types.find((t) => t.slug === review.service_type)?.label;
  return (
    <article className="rounded-lg border border-neutral-200 bg-white p-5">
      <StarRating rating={review.rating} className="mb-3" />
      <p className="text-sm leading-relaxed text-neutral-700">{review.text}</p>
      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs text-neutral-500">
        <span className="font-semibold text-[#464746]">
          {review.author_name}
          {review.author_city ? ` — ${review.author_city}` : ""}
        </span>
        {typeLabel && <span>{typeLabel}</span>}
      </div>
    </article>
  );
}
