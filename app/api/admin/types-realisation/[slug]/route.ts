import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const { slug } = await params;
  const body = await req.json().catch(() => ({}));
  const label = typeof body?.label === "string" ? body.label.trim() : "";
  if (!label) {
    return NextResponse.json({ error: "Nom requis." }, { status: 400 });
  }

  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("types_realisation")
    .update({ label })
    .eq("slug", slug)
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
  return NextResponse.json({ type: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const { slug } = await params;
  const supabase = getAdminSupabase();
  const { error } = await supabase
    .from("types_realisation")
    .delete()
    .eq("slug", slug);

  if (error) {
    if (error.code === "23503") {
      return NextResponse.json(
        {
          error:
            "Ce type est utilisé par des réalisations existantes. Réattribuez-les à un autre type avant de le supprimer.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
