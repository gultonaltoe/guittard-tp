import { NextRequest, NextResponse } from "next/server";
import { getPublicSupabase } from "@/lib/supabase";
import { sendContactNotification } from "@/lib/email";
import type { SiteSettings } from "@/lib/types";

const DEFAULT_NOTIFICATION_EMAIL = "contact@guittardtp.fr";

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

  const supabase = getPublicSupabase();

  try {
    const { error } = await supabase.from("contact_messages").insert({
      nom,
      email,
      telephone: telephone || null,
      message,
    });
    if (error) throw error;
  } catch (err) {
    console.error("contact insert error", err);
    return NextResponse.json(
      { error: "Impossible d'envoyer le message pour le moment." },
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

    await sendContactNotification({
      to: notificationEmail,
      nom,
      email,
      telephone: telephone ? String(telephone) : null,
      message,
    });
  } catch (err) {
    console.error("contact notification email error", err);
    return NextResponse.json(
      {
        error:
          "Votre message a bien été enregistré, mais l'email de notification n'a pas pu être envoyé. Nous vous recontacterons dès que possible.",
      },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
