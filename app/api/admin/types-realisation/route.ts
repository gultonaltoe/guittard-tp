import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function slugify(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export async function GET() {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("types_realisation")
    .select("*")
    .order("position", { ascending: true });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ types: data });
}

export async function POST(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  if (!label) {
    return NextResponse.json({ error: "Nom requis." }, { status: 400 });
  }
  const slug = slugify(label);
  if (!slug) {
    return NextResponse.json({ error: "Nom invalide." }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  const { data: existing } = await supabase
    .from("types_realisation")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .single();
  const position = (existing?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("types_realisation")
    .insert({ slug, label, position })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Un type avec ce nom existe déjà." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ type: data }, { status: 201 });
}
