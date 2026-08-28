"use client";

import { useState, type FormEvent } from "react";
import type { TypeRealisation } from "@/lib/types";
import StarRatingInput from "../StarRatingInput";

export interface ReviewFormValues {
  author_name: string;
  author_city: string;
  rating: number;
  service_type: string;
  text: string;
  status: "en_attente" | "publie" | "masque";
}

export default function ReviewForm({
  initial,
  types,
  mode,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: ReviewFormValues;
  types: TypeRealisation[];
  mode: "create" | "edit";
  submitLabel: string;
  onSubmit: (values: ReviewFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (values.rating < 1) {
      setError("Merci de sélectionner une note.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-neutral-700">Nom du client</label>
          <input
            required
            value={values.author_name}
            onChange={(e) => setValues({ ...values, author_name: e.target.value })}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Ville (optionnel)</label>
          <input
            value={values.author_city}
            onChange={(e) => setValues({ ...values, author_city: e.target.value })}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <StarRatingInput
          label="Note"
          value={values.rating}
          onChange={(rating) => setValues({ ...values, rating })}
          size={20}
        />
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Type de prestation (optionnel)
          </label>
          <select
            value={values.service_type}
            onChange={(e) => setValues({ ...values, service_type: e.target.value })}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">Non précisé</option>
            {types.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">Texte de l&apos;avis</label>
          <textarea
            required
            maxLength={800}
            value={values.text}
            onChange={(e) => setValues({ ...values, text: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">Statut</label>
          {mode === "create" ? (
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={() => setValues({ ...values, status: "publie" })}
                className={`rounded border px-4 py-2 text-sm font-semibold ${
                  values.status === "publie"
                    ? "border-[#e9cc1b] bg-[#fdf6d9] text-[#7a5d0a]"
                    : "border-neutral-300 text-neutral-600"
                }`}
              >
                Publier directement
              </button>
              <button
                type="button"
                onClick={() => setValues({ ...values, status: "masque" })}
                className={`rounded border px-4 py-2 text-sm font-semibold ${
                  values.status === "masque"
                    ? "border-[#e9cc1b] bg-[#fdf6d9] text-[#7a5d0a]"
                    : "border-neutral-300 text-neutral-600"
                }`}
              >
                Enregistrer en brouillon
              </button>
            </div>
          ) : (
            <select
              value={values.status}
              onChange={(e) =>
                setValues({ ...values, status: e.target.value as ReviewFormValues["status"] })
              }
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm sm:w-60"
            >
              <option value="en_attente">En attente</option>
              <option value="publie">Publié</option>
              <option value="masque">Masqué</option>
            </select>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded bg-[#464746] px-5 py-2 text-sm font-semibold text-white hover:bg-[#5a5b5a] disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:border-[#464746]"
          >
            Annuler
          </button>
        )}
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </form>
  );
}
