import { NextRequest, NextResponse } from "next/server";
import { getPublicSupabase } from "@/lib/supabase";
import { sendReviewNotification } from "@/lib/email";
import type { SiteSettings } from "@/lib/types";

const DEFAULT_NOTIFICATION_EMAIL = "contact@guittardtp.fr";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const { author_name, author_city, rating, service_type, text, email } =
    (body ?? {}) as Record<string, unknown>;

  // Honeypot: un champ invisible pour les utilisateurs mais que les robots
  // remplissent souvent. On répond succès sans rien enregistrer.
  if (typeof email === "string" && email.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  if (typeof author_name !== "string" || author_name.trim().length < 1 || author_name.length > 200) {
    return NextResponse.json({ error: "Nom invalide." }, { status: 400 });
  }
  if (
    author_city !== undefined &&
    author_city !== null &&
    author_city !== "" &&
    (typeof author_city !== "string" || author_city.length > 200)
  ) {
    return NextResponse.json({ error: "Ville invalide." }, { status: 400 });
  }
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Note invalide." }, { status: 400 });
  }
  if (typeof text !== "string" || text.trim().length < 1 || text.length > 800) {
    return NextResponse.json({ error: "Avis invalide." }, { status: 400 });
  }
  if (
    service_type !== undefined &&
    service_type !== null &&
    service_type !== "" &&
    typeof service_type !== "string"
  ) {
    return NextResponse.json({ error: "Type de prestation invalide." }, { status: 400 });
  }

  const supabase = getPublicSupabase();

  try {
    const { error } = await supabase.from("reviews").insert({
      author_name: author_name.trim(),
      author_city: author_city ? String(author_city).trim() : null,
      rating,
      service_type: service_type || null,
      text: text.trim(),
      source: "formulaire",
      status: "en_attente",
    });
    if (error) throw error;
  } catch (err) {
    console.error("review insert error", err);
    return NextResponse.json(
      { error: "Impossible d'envoyer votre avis pour le moment." },
      { status: 500 }
    );
  }

  try {
    const { data: settings } = await supabase
      .from("site_settings")
      .select("email")
      .eq("id", 1)
      .single();
    const notificationEmail =
      (settings as Pick<SiteSettings, "email"> | null)?.email ||
      DEFAULT_NOTIFICATION_EMAIL;

    await sendReviewNotification({
      to: notificationEmail,
      authorName: author_name.trim(),
      authorCity: author_city ? String(author_city).trim() : null,
      rating,
      text: text.trim(),
    });
  } catch (err) {
    console.error("review notification email error", err);
    return NextResponse.json(
      {
        error:
          "Votre avis a bien été enregistré, mais l'email de notification n'a pas pu être envoyé.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
