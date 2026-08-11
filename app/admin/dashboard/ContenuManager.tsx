"use client";

import { useEffect, useState } from "react";
import type { ContenuSite } from "@/lib/types";

export default function ContenuManager() {
  const [items, setItems] = useState<ContenuSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/contenu");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Erreur de chargement.");
      setItems(body.contenus ?? []);
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

  if (loading) return <p className="text-sm text-neutral-500">Chargement...</p>;
  if (error) return <p className="text-sm text-red-700">{error}</p>;

  return (
    <div className="space-y-6">
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500">Aucun contenu éditable pour l&apos;instant.</p>
      ) : (
        items.map((item) => (
          <ContenuBlockForm key={item.cle} item={item} onSaved={load} />
        ))
      )}
    </div>
  );
}

function ContenuBlockForm({
  item,
  onSaved,
}: {
  item: ContenuSite;
  onSaved: () => Promise<void>;
}) {
  const [titre, setTitre] = useState(item.titre ?? "");
  const [contenu, setContenu] = useState(item.contenu ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/contenu", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cle: item.cle, titre, contenu }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Échec de l'enregistrement.");
      setSaved(true);
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg bg-white p-6 ring-1 ring-neutral-200"
    >
      <h2 className="font-semibold text-[#464746]">{item.cle}</h2>
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-neutral-700">Titre</label>
          <input
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Contenu</label>
          <textarea
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            rows={5}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="mt-4 rounded bg-[#464746] px-5 py-2 text-sm font-semibold text-white hover:bg-[#5a5b5a] disabled:opacity-50"
      >
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
      {saved && <p className="mt-3 text-sm text-green-700">Enregistré.</p>}
      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
    </form>
  );
}
