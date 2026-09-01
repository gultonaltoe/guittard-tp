"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { CheckCircle2, X } from "lucide-react";
import type { TypeRealisation } from "@/lib/types";
import StarRatingInput from "./StarRatingInput";

export default function AvisForm({ types }: { types: TypeRealisation[] }) {
  const [rating, setRating] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const toastTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
    setErrorMsg("");

    if (rating < 1) {
      setStatus("error");
      setErrorMsg("Merci de sélectionner une note.");
      return;
    }

    setStatus("loading");
    const form = e.currentTarget;
    const data = {
      author_name: (form.elements.namedItem("author_name") as HTMLInputElement).value,
      author_city: (form.elements.namedItem("author_city") as HTMLInputElement).value,
      rating,
      service_type: (form.elements.namedItem("service_type") as HTMLSelectElement).value,
      text: (form.elements.namedItem("text") as HTMLTextAreaElement).value,
      email: (form.elements.namedItem("email") as HTMLInputElement).value,
    };
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody?.error ?? "Erreur lors de l'envoi.");
      }
      setStatus("ok");
      form.reset();
      setRating(0);
      setToastOpen(true);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setToastOpen(false), 6000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Erreur inattendue.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl rounded-lg border border-neutral-200 bg-white p-6 sm:p-10">
      {toastOpen && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 top-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-lg bg-green-600 px-4 py-3 text-white shadow-lg sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2"
        >
          <CheckCircle2 className="h-6 w-6 shrink-0" aria-hidden="true" />
          <p className="text-sm font-medium">
            Merci, votre avis a été transmis et sera publié après validation.
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

      <h2 className="text-center text-xl font-bold text-[#464746] sm:text-2xl">
        Vous êtes client ? Partagez votre expérience
      </h2>
      <p className="mt-2 text-center text-sm text-neutral-500">
        Votre avis sera publié après validation par notre équipe.
      </p>

      <form ref={formRef} onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        {/* Honeypot anti-spam : champ invisible, jamais rempli par un humain */}
        <div className="absolute -left-[9999px]" aria-hidden="true">
          <label htmlFor="avis_email">Ne pas remplir ce champ</label>
          <input
            id="avis_email"
            name="email"
            type="text"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="author_name" className="block text-sm font-medium text-neutral-700">
              Nom
            </label>
            <input
              id="author_name"
              name="author_name"
              required
              maxLength={200}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-[#464746] focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="author_city" className="block text-sm font-medium text-neutral-700">
              Ville (optionnel)
            </label>
            <input
              id="author_city"
              name="author_city"
              maxLength={200}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-[#464746] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <StarRatingInput value={rating} onChange={setRating} />
          <div>
            <label htmlFor="service_type" className="block text-sm font-medium text-neutral-700">
              Type de prestation (optionnel)
            </label>
            <select
              id="service_type"
              name="service_type"
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-[#464746] focus:outline-none"
            >
              <option value="">Non précisé</option>
              {types.map((t) => (
                <option key={t.slug} value={t.slug}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="text" className="block text-sm font-medium text-neutral-700">
            Votre avis
          </label>
          <textarea
            id="text"
            name="text"
            required
            maxLength={800}
            rows={4}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm focus:border-[#464746] focus:outline-none"
          />
        </div>

        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={status === "loading"}
            className="min-h-[44px] rounded bg-[#464746] px-8 py-3 text-sm font-semibold text-white hover:bg-[#5a5b5a] disabled:opacity-50"
          >
            {status === "loading" ? "Envoi..." : "Envoyer mon avis"}
          </button>
        </div>
        {status === "error" && (
          <p role="alert" className="text-center text-sm text-red-700">
            {errorMsg}
          </p>
        )}
        <p className="text-center text-xs text-neutral-500">
          Vos données sont utilisées uniquement pour traiter votre demande. En savoir
          plus :{" "}
          <Link href="/politique-confidentialite" className="underline hover:text-[#464746]">
            Politique de confidentialité
          </Link>
          .
        </p>
      </form>
    </div>
  );
}
