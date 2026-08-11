import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const WEEKS = 12;

function startOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + diffToMonday);
  return d;
}

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const supabase = getAdminSupabase();
  const currentWeekStart = startOfWeek(new Date());
  const rangeStart = new Date(currentWeekStart);
  rangeStart.setDate(rangeStart.getDate() - (WEEKS - 1) * 7);

  const { data, error } = await supabase
    .from("contact_messages")
    .select("created_at")
    .gte("created_at", rangeStart.toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const buckets: { weekStart: Date; label: string; count: number }[] = [];
  for (let i = 0; i < WEEKS; i++) {
    const weekStart = new Date(rangeStart);
    weekStart.setDate(weekStart.getDate() + i * 7);
    buckets.push({
      weekStart,
      label: weekStart.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" }),
      count: 0,
    });
  }

  for (const { created_at } of data ?? []) {
    const bucketStart = startOfWeek(new Date(created_at));
    const bucket = buckets.find((b) => b.weekStart.getTime() === bucketStart.getTime());
    if (bucket) bucket.count += 1;
  }

  const total = buckets.reduce((sum, b) => sum + b.count, 0);

  return NextResponse.json({
    total,
    weeks: buckets.map(({ label, count }) => ({ label, count })),
  });
}
