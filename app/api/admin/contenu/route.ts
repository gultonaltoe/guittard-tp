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
    .from("contenu_site")
    .select("*")
    .order("cle", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ contenus: data });
}

export async function PATCH(req: NextRequest) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const cle = typeof body?.cle === "string" ? body.cle : "";
  if (!cle) {
    return NextResponse.json({ error: "Clé manquante." }, { status: 400 });
  }
  const titre = typeof body?.titre === "string" ? body.titre : undefined;
  const contenu = typeof body?.contenu === "string" ? body.contenu : undefined;

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("contenu_site")
    .update({ titre, contenu, updated_at: new Date().toISOString() })
    .eq("cle", cle)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ contenu: data });
}
