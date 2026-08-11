"use client";

import { useEffect, useState } from "react";
import type { Realisation, Categorie } from "@/lib/types";
import { CATEGORIES } from "@/lib/types";

const EMPTY_FORM = {
  titre: "",
  description: "",
  categorie: "terrassement" as Categorie,
  publie: true,
};

export default function RealisationsManager() {
  const [items, setItems] = useState<Realisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [pendingPhotos, setPendingPhotos] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/realisations");
      if (!res.ok) throw new Error("Erreur de chargement.");
      const body = await res.json();
      setItems(body.realisations ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, intentional
    load();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Échec de l'upload.");
      setPendingPhotos((prev) => [...prev, body.url]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur d'upload.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/realisations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          photos: pendingPhotos,
          position: items.length,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Échec de la création.");
      setForm(EMPTY_FORM);
      setPendingPhotos([]);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublie(item: Realisation) {
    await fetch(`/api/admin/realisations/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publie: !item.publie }),
    });
    await load();
  }

  async function remove(item: Realisation) {
    if (!confirm(`Supprimer "${item.titre}" ?`)) return;
    await fetch(`/api/admin/realisations/${item.id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="rounded-lg bg-white p-6 ring-1 ring-neutral-200">
        <h2 className="font-semibold text-[#464746]">Ajouter une réalisation</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700">Titre</label>
            <input
              required
              value={form.titre}
              onChange={(e) => setForm({ ...form, titre: e.target.value })}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">Catégorie</label>
            <select
              value={form.categorie}
              onChange={(e) =>
                setForm({ ...form, categorie: e.target.value as Categorie })
              }
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-neutral-700">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-neutral-700">Photo</label>
            <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} className="mt-1 text-sm" />
            {pendingPhotos.length > 0 && (
              <p className="mt-1 text-xs text-green-700">{pendingPhotos.length} photo(s) prête(s)</p>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-4 rounded bg-[#464746] px-5 py-2 text-sm font-semibold text-white hover:bg-[#5a5b5a] disabled:opacity-50"
        >
          {saving ? "Enregistrement..." : "Ajouter"}
        </button>
        {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      </form>

      <div className="rounded-lg bg-white ring-1 ring-neutral-200">
        <div className="border-b border-neutral-200 px-6 py-4">
          <h2 className="font-semibold text-[#464746]">Réalisations ({items.length})</h2>
        </div>
        {loading ? (
          <p className="px-6 py-6 text-sm text-neutral-500">Chargement...</p>
        ) : items.length === 0 ? (
          <p className="px-6 py-6 text-sm text-neutral-500">Aucune réalisation pour l&apos;instant.</p>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 px-6 py-4">
                <div>
                  <p className="font-medium text-[#464746]">{item.titre}</p>
                  <p className="text-xs text-neutral-500">
                    {CATEGORIES.find((c) => c.value === item.categorie)?.label} ·{" "}
                    {item.publie ? "Publiée" : "Masquée"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => togglePublie(item)}
                    className="rounded border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-[#464746]"
                  >
                    {item.publie ? "Masquer" : "Publier"}
                  </button>
                  <button
                    onClick={() => remove(item)}
                    className="rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
