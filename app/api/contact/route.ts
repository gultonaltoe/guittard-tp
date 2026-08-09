import { NextRequest, NextResponse } from "next/server";
import { getPublicSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const { nom, email, telephone, message } = (body ?? {}) as Record<string, unknown>;

  if (typeof nom !== "string" || nom.length < 1 || nom.length > 200) {
    return NextResponse.json({ error: "Nom invalide." }, { status: 400 });
  }
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Email invalide." }, { status: 400 });
  }
  if (typeof message !== "string" || message.length < 1 || message.length > 5000) {
    return NextResponse.json({ error: "Message invalide." }, { status: 400 });
  }
  if (telephone !== undefined && telephone !== null && typeof telephone !== "string") {
    return NextResponse.json({ error: "Téléphone invalide." }, { status: 400 });
  }

  try {
    const supabase = getPublicSupabase();
    const { error } = await supabase.from("contact_messages").insert({
      nom,
      email,
      telephone: telephone || null,
      message,
    });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("contact insert error", err);
    return NextResponse.json(
      { error: "Impossible d'envoyer le message pour le moment." },
      { status: 500 }
    );
  }
}
