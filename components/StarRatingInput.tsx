"use client";

import { useId } from "react";
import { Star } from "lucide-react";

export default function StarRatingInput({
  value,
  onChange,
  label = "Votre note",
  size = 26,
}: {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  size?: number;
}) {
  const labelId = useId();

  return (
    <div>
      <span id={labelId} className="block text-sm font-medium text-neutral-700">
        {label}
      </span>
      <div role="radiogroup" aria-labelledby={labelId} className="mt-1 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} étoile${i > 1 ? "s" : ""} sur 5`}
            onClick={() => onChange(i)}
            className="flex min-h-[44px] min-w-[36px] items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e9cc1b] focus-visible:ring-offset-1"
          >
            <Star
              size={size}
              className={i <= value ? "fill-[#e9cc1b] text-[#e9cc1b]" : "fill-neutral-200 text-neutral-300"}
              aria-hidden="true"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
