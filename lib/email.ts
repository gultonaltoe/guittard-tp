import { Resend } from "resend";

/**
 * Lazy instantiation for the same reason as lib/supabase.ts: reading
 * process.env at module scope breaks Next.js route handlers during the
 * Vercel build's "collecting page data" step.
 */
function getResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("Variable d'environnement manquante: RESEND_API_KEY");
  }
  return new Resend(apiKey);
}

export interface ContactNotificationInput {
  to: string;
  nom: string;
  email: string;
  telephone: string | null;
  message: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendContactNotification(
  input: ContactNotificationInput
): Promise<void> {
  const from = process.env.RESEND_FROM_EMAIL || "Site Guittard TP <onboarding@resend.dev>";
  const resend = getResend();

  const { error } = await resend.emails.send({
    from,
    to: input.to,
    replyTo: input.email,
    subject: `Nouvelle demande de contact — ${input.nom}`,
    text: [
      `Nom: ${input.nom}`,
      `Email: ${input.email}`,
      `Téléphone: ${input.telephone || "(non renseigné)"}`,
      "",
      "Message:",
      input.message,
    ].join("\n"),
    html: `
      <p><strong>Nom:</strong> ${escapeHtml(input.nom)}</p>
      <p><strong>Email:</strong> ${escapeHtml(input.email)}</p>
      <p><strong>Téléphone:</strong> ${escapeHtml(input.telephone || "(non renseigné)")}</p>
      <p><strong>Message:</strong></p>
      <p>${escapeHtml(input.message).replace(/\n/g, "<br>")}</p>
    `,
  });

  if (error) {
    throw new Error(`Resend error: ${error.name} — ${error.message}`);
  }
}
