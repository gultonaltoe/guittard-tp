"use client";

import { useId, useState, type FormEvent } from "react";
import type { TypeRealisation } from "@/lib/types";
import PhotoUploader from "./PhotoUploader";

export interface RealisationFormValues {
  titre: string;
  description: string;
  categorie: string;
  publie: boolean;
  photos: string[];
}

export default function RealisationForm({
  initial,
  types,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: RealisationFormValues;
  types: TypeRealisation[];
  submitLabel: string;
  onSubmit: (values: RealisationFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const publieId = useId();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
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
          <label className="block text-sm font-medium text-neutral-700">Titre du chantier</label>
          <input
            required
            value={values.titre}
            onChange={(e) => setValues({ ...values, titre: e.target.value })}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Catégorie</label>
          <select
            value={values.categorie}
            onChange={(e) => setValues({ ...values, categorie: e.target.value })}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          >
            {types.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">Description</label>
          <textarea
            value={values.description}
            onChange={(e) => setValues({ ...values, description: e.target.value })}
            rows={3}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2 flex items-center gap-2">
          <input
            type="checkbox"
            id={publieId}
            checked={values.publie}
            onChange={(e) => setValues({ ...values, publie: e.target.checked })}
            className="h-4 w-4 rounded border-neutral-300"
          />
          <label htmlFor={publieId} className="text-sm text-neutral-700">
            Publier ce chantier sur le site
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">Photos</label>
          <PhotoUploader
            photos={values.photos}
            onChange={(photos) => setValues({ ...values, photos })}
          />
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
