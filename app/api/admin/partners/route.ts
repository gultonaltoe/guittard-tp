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

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .order("position", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ partners: data });
}

export async function POST(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const { name, logo, website_url, description, status } = body ?? {};

  const trimmedName = typeof name === "string" ? name.trim() : "";
  if (!trimmedName) {
    return NextResponse.json({ error: "Nom requis." }, { status: 400 });
  }
  if (
    typeof website_url === "string" &&
    website_url.trim() !== "" &&
    !isValidWebsiteUrl(website_url.trim())
  ) {
    return NextResponse.json({ error: "Lien du site invalide." }, { status: 400 });
  }
  if (status !== undefined && status !== "publie" && status !== "masque") {
    return NextResponse.json({ error: "Statut invalide." }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  const { data: existing } = await supabase
    .from("partners")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .single();
  const position = (existing?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("partners")
    .insert({
      name: trimmedName,
      logo: logo || null,
      website_url: typeof website_url === "string" && website_url.trim() !== "" ? website_url.trim() : null,
      description: typeof description === "string" && description.trim() !== "" ? description.trim() : null,
      position,
      status: status ?? "masque",
    })
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
  return NextResponse.json({ partner: data }, { status: 201 });
}
