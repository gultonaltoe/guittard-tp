"use client";

import { useEffect, useState } from "react";
import { Users, Eye, FileText, Link2, MessageSquare } from "lucide-react";

type Period = 7 | 30 | 90;

type TrafficStats =
  | { status: "not_configured" }
  | { status: "not_enabled" }
  | { status: "error"; message: string }
  | {
      status: "ok";
      visitors: number;
      pageviews: number;
      topPages: { path: string; views: number }[];
      topReferrers: { source: string; views: number }[];
    };

type WeekBucket = { label: string; count: number };

const PERIODS: { value: Period; label: string }[] = [
  { value: 7, label: "7 jours" },
  { value: 30, label: "30 jours" },
  { value: 90, label: "90 jours" },
];

function nombre(n: number) {
  return n.toLocaleString("fr-FR");
}

function RankedList({
  items,
  emptyLabel,
}: {
  items: { label: string; views: number }[];
  emptyLabel: string;
}) {
  if (items.length === 0) {
    return <p className="px-6 py-6 text-sm text-neutral-500">{emptyLabel}</p>;
  }
  const max = Math.max(...items.map((i) => i.views), 1);
  return (
    <ul className="divide-y divide-neutral-100">
      {items.map((item) => (
        <li key={item.label} className="px-6 py-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate font-medium text-[#464746]" title={item.label}>
              {item.label}
            </span>
            <span className="shrink-0 text-neutral-500">{nombre(item.views)}</span>
          </div>
          <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-[#e9cc1b]"
              style={{ width: `${Math.max((item.views / max) * 100, 3)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function WeeklyMessagesChart({ weeks }: { weeks: WeekBucket[] }) {
  const max = Math.max(...weeks.map((w) => w.count), 1);
  return (
    <div className="flex items-end gap-2 px-6 pb-2 pt-6" style={{ height: 160 }}>
      {weeks.map((w) => (
        <div
          key={w.label}
          className="flex flex-1 flex-col items-center justify-end gap-1"
          title={`Semaine du ${w.label} : ${w.count} message${w.count > 1 ? "s" : ""}`}
        >
          <span className="text-[11px] font-medium text-neutral-500">
            {w.count > 0 ? w.count : ""}
          </span>
          <div
            className="w-full rounded-t bg-[#e9cc1b]"
            style={{ height: `${Math.max((w.count / max) * 100, w.count > 0 ? 4 : 1)}%` }}
          />
          <span className="text-[10px] text-neutral-400">{w.label}</span>
        </div>
      ))}
    </div>
  );
}

export default function StatsPanel() {
  const [period, setPeriod] = useState<Period>(30);
  const [traffic, setTraffic] = useState<TrafficStats | null>(null);
  const [trafficLoading, setTrafficLoading] = useState(true);
  const [trafficError, setTrafficError] = useState("");

  const [weeks, setWeeks] = useState<WeekBucket[]>([]);
  const [messagesTotal, setMessagesTotal] = useState(0);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState("");

  async function loadTraffic(p: Period) {
    setTrafficLoading(true);
    setTrafficError("");
    try {
      const res = await fetch(`/api/admin/stats/traffic?period=${p}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Erreur de chargement.");
      setTraffic(body.stats);
    } catch (err) {
      setTrafficError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setTrafficLoading(false);
    }
  }

  async function loadMessages() {
    setMessagesLoading(true);
    setMessagesError("");
    try {
      const res = await fetch("/api/admin/stats/messages");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Erreur de chargement.");
      setWeeks(body.weeks ?? []);
      setMessagesTotal(body.total ?? 0);
    } catch (err) {
      setMessagesError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setMessagesLoading(false);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount/period-change, intentional
    loadTraffic(period);
  }, [period]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount, intentional
    loadMessages();
  }, []);

  return (
    <div className="space-y-8">
      {/* Trafic du site */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-[#464746]">Trafic du site</h2>
          <div className="flex gap-2">
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                  period === p.value
                    ? "bg-[#464746] text-white"
                    : "bg-white text-neutral-700 ring-1 ring-neutral-200 hover:ring-[#e9cc1b]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          {trafficLoading ? (
            <p className="text-sm text-neutral-500">Chargement...</p>
          ) : trafficError ? (
            <p className="text-sm text-red-700">{trafficError}</p>
          ) : !traffic || traffic.status === "not_configured" ? (
            <div className="rounded-lg bg-white p-6 text-sm text-neutral-600 ring-1 ring-neutral-200">
              Le suivi du trafic n&apos;est pas encore configuré. Il faut créer un jeton
              d&apos;accès Vercel et l&apos;ajouter en variable d&apos;environnement
              (VERCEL_API_TOKEN) pour activer cette section.
            </div>
          ) : traffic.status === "not_enabled" ? (
            <div className="rounded-lg bg-white p-6 text-sm text-neutral-600 ring-1 ring-neutral-200">
              Vercel Web Analytics n&apos;est pas encore activé pour ce site. Active-le dans
              les réglages du projet sur Vercel (onglet Analytics) pour commencer à
              collecter des données de visite.
            </div>
          ) : traffic.status === "error" ? (
            <div className="rounded-lg bg-white p-6 text-sm text-red-700 ring-1 ring-neutral-200">
              Impossible de récupérer les statistiques de trafic pour le moment.
            </div>
          ) : traffic.visitors === 0 ? (
            <div className="rounded-lg bg-white p-6 text-sm text-neutral-600 ring-1 ring-neutral-200">
              Pas encore assez de données sur cette période. Les chiffres s&apos;afficheront
              ici dès que le site aura reçu de la visite.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-4 rounded-xl bg-white p-6 ring-1 ring-neutral-200">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e9cc1b]/20 text-[#464746]">
                    <Users size={22} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-3xl font-bold leading-none text-[#464746]">
                      {nombre(traffic.visitors)}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">Visites</p>
                    <p className="mt-1 text-xs text-neutral-400">
                      Cumul des passages sur la période, une même personne peut être comptée
                      plusieurs fois si elle revient un autre jour.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl bg-white p-6 ring-1 ring-neutral-200">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e9cc1b]/20 text-[#464746]">
                    <Eye size={22} strokeWidth={2} />
                  </span>
                  <div>
                    <p className="text-3xl font-bold leading-none text-[#464746]">
                      {nombre(traffic.pageviews)}
                    </p>
                    <p className="mt-1 text-sm text-neutral-500">Pages vues</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-white ring-1 ring-neutral-200">
                  <div className="flex items-center gap-2 border-b border-neutral-200 px-6 py-4">
                    <FileText size={16} className="text-neutral-400" />
                    <h3 className="text-sm font-semibold text-[#464746]">Pages les plus consultées</h3>
                  </div>
                  <RankedList
                    items={traffic.topPages.map((p) => ({ label: p.path, views: p.views }))}
                    emptyLabel="Pas encore de données sur les pages."
                  />
                </div>
                <div className="rounded-lg bg-white ring-1 ring-neutral-200">
                  <div className="flex items-center gap-2 border-b border-neutral-200 px-6 py-4">
                    <Link2 size={16} className="text-neutral-400" />
                    <h3 className="text-sm font-semibold text-[#464746]">Principales provenances</h3>
                  </div>
                  <RankedList
                    items={traffic.topReferrers.map((r) => ({ label: r.source, views: r.views }))}
                    emptyLabel="Pas encore de données sur les provenances."
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Demandes de contact */}
      <section>
        <h2 className="font-semibold text-[#464746]">Demandes de contact reçues</h2>
        <div className="mt-4 rounded-lg bg-white ring-1 ring-neutral-200">
          <div className="flex items-center gap-2 border-b border-neutral-200 px-6 py-4">
            <MessageSquare size={16} className="text-neutral-400" />
            <h3 className="text-sm font-semibold text-[#464746]">
              Messages par semaine {messagesTotal > 0 && `(${messagesTotal} sur 12 semaines)`}
            </h3>
          </div>
          {messagesLoading ? (
            <p className="px-6 py-6 text-sm text-neutral-500">Chargement...</p>
          ) : messagesError ? (
            <p className="px-6 py-6 text-sm text-red-700">{messagesError}</p>
          ) : messagesTotal === 0 ? (
            <p className="px-6 py-6 text-sm text-neutral-500">
              Aucun message de contact reçu sur les 12 dernières semaines.
            </p>
          ) : (
            <WeeklyMessagesChart weeks={weeks} />
          )}
        </div>
      </section>
    </div>
  );
}
