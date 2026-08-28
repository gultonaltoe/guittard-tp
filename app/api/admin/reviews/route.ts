import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ reviews: data });
}

export async function POST(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { author_name, author_city, rating, service_type, text, status } = body ?? {};

  const trimmedName = typeof author_name === "string" ? author_name.trim() : "";
  if (!trimmedName) {
    return NextResponse.json({ error: "Nom requis." }, { status: 400 });
  }
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Note invalide." }, { status: 400 });
  }
  const trimmedText = typeof text === "string" ? text.trim() : "";
  if (!trimmedText || trimmedText.length > 800) {
    return NextResponse.json({ error: "Texte de l'avis invalide." }, { status: 400 });
  }
  if (status !== "publie" && status !== "masque") {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("reviews")
    .insert({
      author_name: trimmedName,
      author_city:
        typeof author_city === "string" && author_city.trim() !== "" ? author_city.trim() : null,
      rating,
      service_type: typeof service_type === "string" && service_type !== "" ? service_type : null,
      text: trimmedText,
      source: "manuel",
      status,
      published_at: status === "publie" ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ review: data }, { status: 201 });
}
