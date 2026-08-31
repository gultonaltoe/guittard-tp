"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, X } from "lucide-react";
import type { SiteSettings } from "@/lib/types";

export default function Contact({ settings }: { settings: SiteSettings }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">(
    "idle"
  );
  const [errorMsg, setErrorMsg] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const telHref = `tel:${settings.telephone.replace(/\s+/g, "")}`;

  useEffect(() => {
    return () => {
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
    };
  }, []);

  function closeToast() {
    setToastOpen(false);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    const form = e.currentTarget;
    const data = {
      nom: (form.elements.namedItem("nom") as HTMLInputElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
      telephone: (form.elements.namedItem("telephone") as HTMLInputElement)
        .value,
      message: (form.elements.namedItem("message") as HTMLTextAreaElement)
        .value,
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Erreur lors de l'envoi.");
      }
      setStatus("ok");
      form.reset();
      setToastOpen(true);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setToastOpen(false), 5000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erreur inattendue.");
    }
  }

  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      {toastOpen && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 top-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-lg bg-green-600 px-4 py-3 text-white shadow-lg sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
        >
          <CheckCircle2 className="h-6 w-6 shrink-0" aria-hidden="true" />
          <p className="text-sm font-medium">
            Votre message a bien été envoyé ! Nous vous recontacterons rapidement.
          </p>
          <button
            type="button"
            onClick={closeToast}
            aria-label="Fermer"
            className="ml-auto shrink-0 rounded p-1 hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <h2 className="text-2xl font-bold text-[#464746] sm:text-3xl">
        Nous contacter
      </h2>
      <p className="mt-2 max-w-2xl text-neutral-600">
        Un projet de terrassement, d&apos;aménagement extérieur ou de VRD ?
        Contactez-nous pour un devis gratuit.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <ul className="space-y-3 text-sm text-neutral-700">
          <li>
            <span className="font-semibold text-[#464746]">Téléphone : </span>
            <a href={telHref} className="hover:text-[#b8901f]">
              {settings.telephone}
            </a>
          </li>
          <li>
            <span className="font-semibold text-[#464746]">Email : </span>
            <a
              href={`mailto:${settings.email}`}
              className="hover:text-[#b8901f]"
            >
              {settings.email}
            </a>
          </li>
          <li>
            <span className="font-semibold text-[#464746]">Adresse : </span>
            {settings.adresse}
          </li>
          <li>
            <span className="font-semibold text-[#464746]">
              Zone d&apos;intervention :{" "}
            </span>
            {settings.zone_intervention}
          </li>
        </ul>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nom" className="block text-sm font-medium text-neutral-700">
              Nom
            </label>
            <input
              id="nom"
              name="nom"
              required
              maxLength={200}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-[#464746] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-neutral-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-[#464746] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="telephone" className="block text-sm font-medium text-neutral-700">
              Téléphone (optionnel)
            </label>
            <input
              id="telephone"
              name="telephone"
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-[#464746] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-neutral-700">
              Votre projet
            </label>
            <textarea
              id="message"
              name="message"
              required
              maxLength={5000}
              rows={4}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-[#464746] focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="rounded bg-[#464746] px-6 py-3 text-sm font-semibold text-white hover:bg-[#5a5b5a] disabled:opacity-50"
          >
            {status === "loading" ? "Envoi..." : "Envoyer ma demande"}
          </button>
          {status === "error" && (
            <p className="text-sm text-red-700">{errorMsg}</p>
          )}
        </form>
      </div>
    </section>
  );
}
