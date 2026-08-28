"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { Upload, X } from "lucide-react";

export interface PartnerFormValues {
  name: string;
  logo: string;
  website_url: string;
  description: string;
  status: "publie" | "masque";
}

const ALLOWED_TYPES = "image/jpeg,image/png,image/webp";

export default function PartnerForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: PartnerFormValues;
  submitLabel: string;
  onSubmit: (values: PartnerFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const statusId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadLogo(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Échec de l'upload.");
      setValues((v) => ({ ...v, logo: body.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'upload.");
    } finally {
      setUploading(false);
    }
  }

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
          <label className="block text-sm font-medium text-neutral-700">Nom du partenaire</label>
          <input
            required
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Lien du site (optionnel)
          </label>
          <input
            type="url"
            placeholder="https://..."
            value={values.website_url}
            onChange={(e) => setValues({ ...values, website_url: e.target.value })}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">
            Description courte (optionnelle)
          </label>
          <textarea
            value={values.description}
            onChange={(e) => setValues({ ...values, description: e.target.value })}
            rows={2}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">Logo</label>
          <div className="mt-1 flex items-center gap-4">
            <div className="flex h-16 w-24 shrink-0 items-center justify-center overflow-hidden rounded border border-neutral-200 bg-white">
              {values.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={values.logo} alt="" className="h-full w-full object-contain p-1" />
              ) : (
                <span className="text-[10px] text-neutral-400">Pas de logo</span>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 rounded border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-[#464746] disabled:opacity-50"
              >
                <Upload size={14} />
                {uploading ? "Envoi..." : values.logo ? "Changer le logo" : "Choisir un logo"}
              </button>
              {values.logo && (
                <button
                  type="button"
                  onClick={() => setValues((v) => ({ ...v, logo: "" }))}
                  className="ml-2 rounded border border-red-200 px-2 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                  aria-label="Retirer le logo"
                >
                  <X size={14} />
                </button>
              )}
              <input
                ref={inputRef}
                type="file"
                accept={ALLOWED_TYPES}
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadLogo(file);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={statusId} className="block text-sm font-medium text-neutral-700">
            Statut
          </label>
          <select
            id={statusId}
            value={values.status}
            onChange={(e) =>
              setValues({ ...values, status: e.target.value as "publie" | "masque" })
            }
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm sm:w-60"
          >
            <option value="masque">Masqué</option>
            <option value="publie">Publié</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving || uploading}
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
