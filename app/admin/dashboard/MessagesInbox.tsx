"use client";

import { useEffect, useState } from "react";
import type { ContactMessage } from "@/lib/types";

export default function MessagesInbox() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  async function markLu(m: ContactMessage) {
    await fetch(`/api/admin/messages/${m.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lu: !m.lu }),
    });
    await load();
  }

  async function remove(m: ContactMessage) {
    if (!confirm(`Supprimer le message de ${m.nom} ?`)) return;
    await fetch(`/api/admin/messages/${m.id}`, { method: "DELETE" });
    await load();
  }

  if (loading) return <p className="text-sm text-neutral-500">Chargement...</p>;
  if (error) return <p className="text-sm text-red-700">{error}</p>;

  return (
    <div className="rounded-lg bg-white ring-1 ring-neutral-200">
      <div className="border-b border-neutral-200 px-6 py-4">
        <h2 className="font-semibold text-[#1c1f22]">Messages ({messages.length})</h2>
      </div>
      {messages.length === 0 ? (
        <p className="px-6 py-6 text-sm text-neutral-500">Aucun message pour l&apos;instant.</p>
      ) : (
        <ul className="divide-y divide-neutral-200">
          {messages.map((m) => (
            <li key={m.id} className={`px-6 py-4 ${m.lu ? "" : "bg-yellow-50"}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-[#1c1f22]">
                    {m.nom} <span className="font-normal text-neutral-500">· {m.email}</span>
                  </p>
                  {m.telephone && <p className="text-xs text-neutral-500">{m.telephone}</p>}
                  <p className="mt-2 text-sm text-neutral-700">{m.message}</p>
                  <p className="mt-2 text-xs text-neutral-400">
                    {new Date(m.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={() => markLu(m)}
                    className="rounded border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:border-[#1c1f22]"
                  >
                    {m.lu ? "Marquer non lu" : "Marquer lu"}
                  </button>
                  <button
                    onClick={() => remove(m)}
                    className="rounded border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
