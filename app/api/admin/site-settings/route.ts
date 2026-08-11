import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
// Plausible: chiffres/espaces/+()-. uniquement, au moins 6 chiffres au total.
const PHONE_RE = /^[0-9 +().-]{6,20}$/;

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ settings: data });
}

export async function PATCH(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const allowed = ["telephone", "email", "adresse", "zone_intervention"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  if ("email" in update) {
    if (typeof update.email !== "string" || !EMAIL_RE.test(update.email)) {
      return NextResponse.json({ error: "Email invalide." }, { status: 400 });
    }
  }
  if ("telephone" in update) {
    const digitCount =
      typeof update.telephone === "string"
        ? (update.telephone.match(/[0-9]/g) ?? []).length
        : 0;
    if (
      typeof update.telephone !== "string" ||
      !PHONE_RE.test(update.telephone) ||
      digitCount < 6
    ) {
      return NextResponse.json({ error: "Téléphone invalide." }, { status: 400 });
    }
  }
  if ("adresse" in update && (typeof update.adresse !== "string" || update.adresse.trim().length === 0)) {
    return NextResponse.json({ error: "Adresse invalide." }, { status: 400 });
  }
  if (
    "zone_intervention" in update &&
    (typeof update.zone_intervention !== "string" || update.zone_intervention.trim().length === 0)
  ) {
    return NextResponse.json({ error: "Zone d'intervention invalide." }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("site_settings")
    .update({ ...update, updated_at: new Date().toISOString() })
    .eq("id", 1)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ settings: data });
}
