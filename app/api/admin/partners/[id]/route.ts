import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function isValidWebsiteUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const allowed = ["name", "logo", "website_url", "description", "position", "status"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) update[key] = body[key];
  }

  if ("name" in update) {
    const trimmedName = typeof update.name === "string" ? update.name.trim() : "";
    if (!trimmedName) {
      return NextResponse.json({ error: "Nom requis." }, { status: 400 });
    }
    update.name = trimmedName;
  }
  if ("website_url" in update) {
    const raw = typeof update.website_url === "string" ? update.website_url.trim() : "";
    if (raw !== "" && !isValidWebsiteUrl(raw)) {
      return NextResponse.json({ error: "Lien du site invalide." }, { status: 400 });
    }
    update.website_url = raw || null;
  }
  if ("description" in update) {
    const raw = typeof update.description === "string" ? update.description.trim() : "";
    update.description = raw || null;
  }
  if ("logo" in update && !update.logo) {
    update.logo = null;
  }
  if ("status" in update && update.status !== "publie" && update.status !== "masque") {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("partners")
    .update(update)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Un partenaire avec ce nom existe déjà." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ partner: data });
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
  const { error } = await supabase.from("partners").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
