"use client";

import { useEffect, useState } from "react";
import type { SiteSettings } from "@/lib/types";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^[0-9 +().-]{6,20}$/;

function validate(settings: SiteSettings): string {
  if (!EMAIL_RE.test(settings.email)) return "Email invalide.";
  const digitCount = (settings.telephone.match(/[0-9]/g) ?? []).length;
  if (!PHONE_RE.test(settings.telephone) || digitCount < 6) {
    return "Téléphone invalide.";
  }
  return "";
}

export default function CoordonneesManager() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/site-settings");
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Erreur de chargement.");
      setSettings(body.settings ?? null);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    const validationError = validate(settings);
    if (validationError) {
      setError(validationError);
      setSaved(false);
      return;
    }
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/site-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          telephone: settings.telephone,
          email: settings.email,
          adresse: settings.adresse,
          zone_intervention: settings.zone_intervention,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? "Échec de l'enregistrement.");
      setSettings(body.settings);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inattendue.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-neutral-500">Chargement...</p>;
  if (error && !settings) return <p className="text-sm text-red-700">{error}</p>;
  if (!settings) return null;

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 ring-1 ring-neutral-200">
      <h2 className="font-semibold text-[#464746]">Coordonnées affichées sur le site</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-neutral-700">Téléphone</label>
          <input
            required
            type="tel"
            pattern="[0-9 +().-]{6,20}"
            title="6 à 20 caractères : chiffres, espaces, + ( ) -"
            value={settings.telephone}
            onChange={(e) => setSettings({ ...settings, telephone: e.target.value })}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-neutral-700">Email</label>
          <input
            required
            type="email"
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">Adresse</label>
          <input
            required
            value={settings.adresse}
            onChange={(e) => setSettings({ ...settings, adresse: e.target.value })}
            className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-neutral-700">
            Zone d&apos;intervention
          </label>
          <input
            required
            value={settings.zone_intervention}
            onChange={(e) => setSettings({ ...settings, zone_intervention: e.target.value })}
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
