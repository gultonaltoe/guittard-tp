import { Star } from "lucide-react";

export default function StarRating({
  rating,
  size = 15,
  className = "",
}: {
  rating: number;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${rating} étoile${rating > 1 ? "s" : ""} sur 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= rating ? "fill-[#e9cc1b] text-[#e9cc1b]" : "fill-neutral-200 text-neutral-200"}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
