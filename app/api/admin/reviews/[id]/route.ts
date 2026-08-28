import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const allowed = ["author_name", "author_city", "rating", "service_type", "text", "status"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  if ("author_name" in update) {
    const trimmedName = typeof update.author_name === "string" ? update.author_name.trim() : "";
    if (!trimmedName) {
      return NextResponse.json({ error: "Nom requis." }, { status: 400 });
    }
    update.author_name = trimmedName;
  }
  if ("author_city" in update) {
    const raw = typeof update.author_city === "string" ? update.author_city.trim() : "";
    update.author_city = raw || null;
  }
  if ("rating" in update) {
    if (
      typeof update.rating !== "number" ||
      !Number.isInteger(update.rating) ||
      update.rating < 1 ||
      update.rating > 5
    ) {
      return NextResponse.json({ error: "Note invalide." }, { status: 400 });
    }
  }
  if ("service_type" in update) {
    update.service_type =
      typeof update.service_type === "string" && update.service_type !== ""
        ? update.service_type
        : null;
  }
  if ("text" in update) {
    const raw = typeof update.text === "string" ? update.text.trim() : "";
    if (!raw || raw.length > 800) {
      return NextResponse.json({ error: "Texte de l'avis invalide." }, { status: 400 });
    }
    update.text = raw;
  }
  if (
    "status" in update &&
    update.status !== "en_attente" &&
    update.status !== "publie" &&
    update.status !== "masque"
  ) {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  const supabase = getAdminSupabase();

  if (update.status === "publie") {
    const { data: existing } = await supabase
      .from("reviews")
      .select("published_at")
      .eq("id", id)
      .single();
    if (!existing?.published_at) {
      update.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from("reviews")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ review: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const { id } = await params;
  const supabase = getAdminSupabase();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
