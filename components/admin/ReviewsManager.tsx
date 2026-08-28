"use client";

import { useEffect, useId, useMemo, useState } from "react";
import type { Review, SiteSettings, TypeRealisation } from "@/lib/types";
import ReviewForm, { type ReviewFormValues } from "./ReviewForm";
import StarRating from "../StarRating";
import { Check, EyeOff, Pencil, Trash2 } from "lucide-react";

const emptyForm: ReviewFormValues = {
  author_name: "",
  author_city: "",
  rating: 0,
  service_type: "",
  text: "",
  status: "masque",
};

const STATUT_PRIORITE: Record<Review["status"], number> = {
  en_attente: 0,
  publie: 1,
  masque: 2,
};

function toFormValues(item: Review): ReviewFormValues {
  return {
    author_name: item.author_name,
    author_city: item.author_city ?? "",
    rating: item.rating,
    service_type: item.service_type ?? "",
    text: item.text,
    status: item.status,
  };
}

export default function ReviewsManager() {
  const [items, setItems] = useState<Review[]>([]);
  const [types, setTypes] = useState<TypeRealisation[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [togglingSection, setTogglingSection] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggleId = useId();

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [resItems, resSettings, resTypes] = await Promise.all([
        fetch("/api/admin/reviews"),
        fetch("/api/admin/site-settings"),
        fetch("/api/admin/types-realisation"),
      ]);
      if (!resItems.ok || !resSettings.ok || !resTypes.ok) throw new Error("Erreur de chargement.");
      const [bodyItems, bodySettings, bodyTypes] = await Promise.all([
        resItems.json(),
        resSettings.json(),
        resTypes.json(),
      ]);
      setItems(bodyItems.reviews ?? []);
      setSettings(bodySettings.settings ?? null);
      setTypes(bodyTypes.types ?? []);
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

  const sorted = useMemo(
    () =>
      [...items].sort((a, b) => {
        const diff = STATUT_PRIORITE[a.status] - STATUT_PRIORITE[b.status];
        if (diff !== 0) return diff;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }),
    [items]
  );

  async function toggleSection() {
    if (!settings) return;
    const next = !settings.avis_section_enabled;
    setSettings({ ...settings, avis_section_enabled: next });
    setTogglingSection(true);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avis_section_enabled: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setSettings({ ...settings, avis_section_enabled: !next });
      setError("Échec de la mise à jour de l'affichage.");
    } finally {
      setTogglingSection(false);
    }
  }

  async function handleCreate(values: ReviewFormValues) {
    const res = await fetch("/api/admin/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.error ?? "Échec de la création.");
    setCreating(false);
    await load();
  }

  async function handleUpdate(id: string, values: ReviewFormValues) {
    const res = await fetch(`/api/admin/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const body = await res.json();
    if (!res.ok) throw new Error(body?.error ?? "Échec de la modification.");
    setEditingId(null);
    await load();
  }

  async function setStatus(item: Review, status: Review["status"]) {
    const res = await fetch(`/api/admin/reviews/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      setError("Échec de la mise à jour du statut.");
      return;
    }
    await load();
  }

  async function remove(item: Review) {
    const confirmed = confirm(
      `Supprimer définitivement l'avis de "${item.author_name}" ?\n\nCette action est définitive.`
    );
    if (!confirmed) return;
    const res = await fetch(`/api/admin/reviews/${item.id}`, { method: "DELETE" });
    if (!res.ok) {
      setError("Échec de la suppression.");
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 ring-1 ring-neutral-200">
        <div className="flex items-center justify-between gap-4">
          <label htmlFor={toggleId} className="font-semibold text-[#464746]">
            Afficher la section sur le site
          </label>
          <button
            id={toggleId}
            role="switch"
            type="button"
            aria-checked={settings?.avis_section_enabled ?? false}
            onClick={toggleSection}
            disabled={loading || togglingSection || !settings}
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
              settings?.avis_section_enabled ? "bg-[#464746]" : "bg-neutral-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                settings?.avis_section_enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
        {!settings?.avis_section_enabled && (
          <p className="mt-2 text-sm text-neutral-500">
            Section masquée sur le site public tant qu&apos;elle n&apos;est pas activée ci-dessus.
          </p>
        )}
      </div>

      <div className="flex items-center justify-end">
        <button
          onClick={() => {
            setCreating((v) => !v);
            setEditingId(null);
          }}
          className="rounded bg-[#464746] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5a5b5a]"
        >
          {creating ? "Fermer" : "+ Ajouter un avis"}
        </button>
      </div>

      {creating && (
        <div className="rounded-lg bg-white p-6 ring-1 ring-neutral-200">
          <h2 className="font-semibold text-[#464746]">Nouvel avis</h2>
          <div className="mt-4">
            <ReviewForm
              initial={emptyForm}
              types={types}
              mode="create"
              submitLabel="Créer l'avis"
              onSubmit={handleCreate}
              onCancel={() => setCreating(false)}
            />
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}

      <div className="rounded-lg bg-white ring-1 ring-neutral-200">
        <div className="border-b border-neutral-200 px-6 py-4">
          <h2 className="font-semibold text-[#464746]">Avis ({items.length})</h2>
        </div>

        {loading ? (
          <p className="px-6 py-6 text-sm text-neutral-500">Chargement...</p>
        ) : sorted.length === 0 ? (
          <p className="px-6 py-6 text-sm text-neutral-500">Aucun avis pour l&apos;instant.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  <th className="px-4 py-3">Auteur</th>
                  <th className="px-4 py-3">Note</th>
                  <th className="px-4 py-3">Avis</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {sorted.map((item) =>
                  editingId === item.id ? (
                    <tr key={item.id} className="bg-neutral-50">
                      <td colSpan={8} className="px-4 py-4">
                        <ReviewForm
                          initial={toFormValues(item)}
                          types={types}
                          mode="edit"
                          submitLabel="Enregistrer"
                          onSubmit={(values) => handleUpdate(item.id, values)}
                          onCancel={() => setEditingId(null)}
                        />
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={item.id}
                      className={item.status === "en_attente" ? "bg-[#fdf6d9]/50" : undefined}
                    >
                      <td className="px-4 py-3 align-top font-medium text-[#464746]">
                        {item.author_name}
                        {item.author_city && (
                          <span className="block text-xs font-normal text-neutral-500">
                            {item.author_city}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StarRating rating={item.rating} size={13} />
                      </td>
                      <td className="max-w-[260px] px-4 py-3 align-top text-neutral-600">
                        {expandedId === item.id ? (
                          <>
                            <p>{item.text}</p>
                            <button
                              type="button"
                              onClick={() => setExpandedId(null)}
                              className="mt-1 text-xs font-medium text-[#464746] underline"
                            >
                              Réduire
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="truncate">« {item.text} »</p>
                            {item.text.length > 40 && (
                              <button
                                type="button"
                                onClick={() => setExpandedId(item.id)}
                                className="mt-1 text-xs font-medium text-[#464746] underline"
                              >
                                Voir tout
                              </button>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top text-neutral-600">
                        {types.find((t) => t.slug === item.service_type)?.label ?? "—"}
                      </td>
                      <td className="px-4 py-3 align-top text-neutral-500">
                        {item.source === "manuel" ? "Manuel" : "Formulaire site"}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                            item.status === "publie"
                              ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                              : item.status === "en_attente"
                                ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                : "bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200"
                          }`}
                        >
                          {item.status === "publie"
                            ? "Publié"
                            : item.status === "en_attente"
                              ? "En attente"
                              : "Masqué"}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-neutral-500">
                        {new Date(item.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2">
                          {item.status !== "publie" && (
                            <button
                              onClick={() => setStatus(item, "publie")}
                              className="rounded border border-green-200 p-1.5 text-green-700 hover:bg-green-50"
                              aria-label="Publier"
                              title="Publier"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingId(item.id);
                              setCreating(false);
                            }}
                            className="rounded border border-neutral-300 p-1.5 text-neutral-600 hover:border-[#464746] hover:text-[#464746]"
                            aria-label="Modifier"
                            title="Modifier"
                          >
                            <Pencil size={14} />
                          </button>
                          {item.status !== "masque" && (
                            <button
                              onClick={() => setStatus(item, "masque")}
                              className="rounded border border-neutral-300 p-1.5 text-neutral-600 hover:border-[#464746] hover:text-[#464746]"
                              aria-label="Masquer"
                              title="Masquer"
                            >
                              <EyeOff size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => remove(item)}
                            className="rounded border border-red-200 p-1.5 text-red-700 hover:bg-red-50"
                            aria-label="Supprimer"
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
