"use client";

import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, Trash2 } from "lucide-react";
import type { ContactMessage } from "@/lib/types";

type Filtre = "tous" | "non_lu" | "lu";

function preview(message: string, max = 90) {
  const flat = message.replace(/\s+/g, " ").trim();
  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MessagesInbox() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtre, setFiltre] = useState<Filtre>("tous");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/messages");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Erreur de chargement.");
      setMessages(body.messages ?? []);
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

  async function setLu(m: ContactMessage, lu: boolean) {
    setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, lu } : x)));
    const res = await fetch(`/api/admin/messages/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lu }),
    });
    if (!res.ok) {
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, lu: m.lu } : x)));
      setError("Échec de la mise à jour du statut.");
    }
  }

  function toggleExpand(m: ContactMessage) {
    const opening = expandedId !== m.id;
    setExpandedId(opening ? m.id : null);
    if (opening && !m.lu) {
      void setLu(m, true);
    }
  }

  async function remove(m: ContactMessage) {
    if (!confirm(`Supprimer le message de ${m.nom} ?`)) return;
    await fetch(`/api/admin/messages/${m.id}`, { method: "DELETE" });
    if (expandedId === m.id) setExpandedId(null);
    await load();
  }

  const nonLusCount = useMemo(() => messages.filter((m) => !m.lu).length, [messages]);
  const visibles = useMemo(() => {
    if (filtre === "non_lu") return messages.filter((m) => !m.lu);
    if (filtre === "lu") return messages.filter((m) => m.lu);
    return messages;
  }, [messages, filtre]);

  if (loading) return <p className="text-sm text-neutral-500">Chargement...</p>;
  if (error) return <p className="text-sm text-red-700">{error}</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            { value: "tous", label: "Tous" },
            { value: "non_lu", label: `Non lus (${nonLusCount})` },
            { value: "lu", label: "Lus" },
          ] as { value: Filtre; label: string }[]
        ).map((f) => (
          <button
            key={f.value}
            onClick={() => setFiltre(f.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              filtre === f.value
                ? "bg-[#464746] text-white"
                : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:ring-[#e9cc1b]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-lg bg-white ring-1 ring-neutral-200">
        <div className="border-b border-neutral-200 px-6 py-4">
          <h2 className="font-semibold text-[#464746]">Messages ({visibles.length})</h2>
        </div>
        {visibles.length === 0 ? (
          <p className="px-6 py-6 text-sm text-neutral-500">Aucun message pour l&apos;instant.</p>
        ) : (
          <ul className="divide-y divide-neutral-200">
            {visibles.map((m) => {
              const expanded = expandedId === m.id;
              return (
                <li key={m.id} className={!m.lu ? "bg-yellow-50/70" : ""}>
                  <button
                    type="button"
                    onClick={() => toggleExpand(m)}
                    className="flex w-full items-start justify-between gap-4 px-6 py-4 text-left"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {!m.lu && (
                          <span
                            className="h-2 w-2 shrink-0 rounded-full bg-[#e9cc1b]"
                            title="Non lu"
                            aria-hidden="true"
                          />
                        )}
                        <p className={`truncate ${!m.lu ? "font-semibold" : "font-medium"} text-[#464746]`}>
                          {m.nom}
                        </p>
                        <span className="shrink-0 text-xs text-neutral-500">{m.email}</span>
                        {m.telephone && (
                          <span className="hidden shrink-0 text-xs text-neutral-400 sm:inline">
                            · {m.telephone}
                          </span>
                        )}
                      </div>
                      {!expanded && (
                        <p className="mt-1 truncate text-sm text-neutral-600">{preview(m.message)}</p>
                      )}
                    </div>
                    <div className="shrink-0 text-right text-xs text-neutral-400">
                      {formatDate(m.created_at)}
                      {!m.lu && (
                        <p className="mt-1 font-semibold uppercase tracking-wide text-[#b8960c]">
                          Nouveau
                        </p>
                      )}
                    </div>
                  </button>

                  {expanded && (
                    <div className="border-t border-neutral-100 px-6 py-4">
                      <p className="whitespace-pre-wrap text-sm text-neutral-700">{m.message}</p>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <a
                          href={`mailto:${m.email}`}
                          className="flex items-center gap-1.5 rounded border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-[#464746]"
                        >
                          <Mail size={14} />
                          Répondre par email
                        </a>
                        {m.telephone && (
                          <a
                            href={`tel:${m.telephone}`}
                            className="flex items-center gap-1.5 rounded border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-[#464746]"
                          >
                            <Phone size={14} />
                            Appeler {m.telephone}
                          </a>
                        )}
                        <button
                          onClick={() => setLu(m, !m.lu)}
                          className="rounded border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-[#464746]"
                        >
                          {m.lu ? "Marquer non lu" : "Marquer lu"}
                        </button>
                        <button
                          onClick={() => remove(m)}
                          className="flex items-center gap-1.5 rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
