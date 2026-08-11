import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/server";
import { getTrafficStats } from "@/lib/vercel-analytics";

export const dynamic = "force-dynamic";

const VALID_PERIODS = [7, 30, 90] as const;

export async function GET(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const periodParam = Number(req.nextUrl.searchParams.get("period"));
  const period = VALID_PERIODS.includes(periodParam as (typeof VALID_PERIODS)[number])
    ? (periodParam as (typeof VALID_PERIODS)[number])
    : 30;

  const stats = await getTrafficStats(period);
  return NextResponse.json({ period, stats });
}
