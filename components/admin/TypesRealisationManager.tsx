"use client";

import { useEffect, useState, type FormEvent } from "react";
import type { TypeRealisation } from "@/lib/types";
import { Pencil, Trash2, X, Check } from "lucide-react";

export default function TypesRealisationManager() {
  const [types, setTypes] = useState<TypeRealisation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/types-realisation");
      if (!res.ok) throw new Error("Erreur de chargement.");
      const body = await res.json();
      setTypes(body.types ?? []);
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

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      const res = await fetch("/api/admin/types-realisation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Échec de la création.");
      setNewLabel("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setCreating(false);
    }
  }

  async function handleRename(slug: string) {
    setError("");
    try {
      const res = await fetch(`/api/admin/types-realisation/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: editingLabel }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Échec de la modification.");
      setEditingSlug(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    }
  }

  async function handleDelete(type: TypeRealisation) {
    const confirmed = confirm(`Supprimer le type "${type.label}" ?`);
    if (!confirmed) return;
    setError("");
    const res = await fetch(`/api/admin/types-realisation/${type.slug}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body?.error ?? "Échec de la suppression.");
      return;
    }
    setTypes((prev) => prev.filter((t) => t.slug !== type.slug));
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-sm font-medium text-neutral-700">
            Nouveau type
          </label>
          <input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Ex : Élagage"
            required
            className="mt-1 rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={creating}
          className="rounded bg-[#464746] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5a5b5a] disabled:opacity-50"
        >
          {creating ? "Création..." : "+ Ajouter"}
        </button>
      </form>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="rounded-lg bg-white ring-1 ring-neutral-200">
        <div className="border-b border-neutral-200 px-6 py-4">
          <h2 className="font-semibold text-[#464746]">Types ({types.length})</h2>
        </div>
        {loading ? (
          <p className="px-6 py-6 text-sm text-neutral-500">Chargement...</p>
        ) : types.length === 0 ? (
          <p className="px-6 py-6 text-sm text-neutral-500">Aucun type pour l&apos;instant.</p>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {types.map((t) => (
              <li key={t.slug} className="flex items-center gap-4 px-6 py-4">
                {editingSlug === t.slug ? (
                  <>
                    <input
                      value={editingLabel}
                      onChange={(e) => setEditingLabel(e.target.value)}
                      className="flex-1 rounded border border-neutral-300 px-3 py-1.5 text-sm"
                      autoFocus
                    />
                    <button
                      onClick={() => handleRename(t.slug)}
                      className="rounded border border-neutral-300 p-1.5 text-neutral-600 hover:border-[#464746] hover:text-[#464746]"
                      aria-label="Enregistrer"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={() => setEditingSlug(null)}
                      className="rounded border border-neutral-300 p-1.5 text-neutral-600 hover:border-[#464746] hover:text-[#464746]"
                      aria-label="Annuler"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-[#464746]">{t.label}</p>
                      <p className="text-xs text-neutral-400">{t.slug}</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingSlug(t.slug);
                        setEditingLabel(t.label);
                      }}
                      className="rounded border border-neutral-300 p-1.5 text-neutral-600 hover:border-[#464746] hover:text-[#464746]"
                      aria-label="Modifier"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(t)}
                      className="rounded border border-red-200 p-1.5 text-red-700 hover:bg-red-50"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
