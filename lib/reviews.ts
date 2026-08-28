import type { Review } from "./types";

export function computeAverageRating(reviews: Review[]): {
  average: number;
  count: number;
} {
  const count = reviews.length;
  if (count === 0) return { average: 0, count: 0 };
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const average = Math.round((sum / count) * 10) / 10;
  return { average, count };
}
