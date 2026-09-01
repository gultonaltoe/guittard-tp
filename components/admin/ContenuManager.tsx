"use client";

import { useEffect, useState } from "react";
import type { ContenuSite } from "@/lib/types";

// Certains blocs de contenu générique (titre + contenu par "cle") portent en
// réalité des champs à usage plus précis : ce mapping affine seulement leur
// libellé et leur nom de bloc dans l'admin, sans changer le schéma générique.
const BLOCK_TITLES: Record<string, string> = {
  notre_histoire: "Notre histoire",
  notre_histoire_cta: "Notre histoire — Appel à l'action",
  mentions_legales: "Mentions légales",
  politique_confidentialite: "Politique de confidentialité",
};

const FIELD_LABELS: Record<string, { titre: string; contenu: string }> = {
  notre_histoire: {
    titre: "Titre",
    contenu: "Corps de texte (séparez les paragraphes par une ligne vide)",
  },
  notre_histoire_cta: {
    titre: "Texte de l'appel à l'action",
    contenu: "Texte surligné (affiché en jaune juste après)",
  },
  mentions_legales: { titre: "", contenu: "Texte de la page" },
  politique_confidentialite: { titre: "", contenu: "Texte de la page" },
};

// Ces deux blocs n'ont pas de champ "Titre" (le titre de page reste fixe dans
// le code) et utilisent une mini-syntaxe au lieu de simples paragraphes.
const LEGAL_BLOCKS = new Set(["mentions_legales", "politique_confidentialite"]);

const LEGAL_CONTENT_HELP =
  "Syntaxe : \"## Titre\" pour un sous-titre, \"- \" en début de ligne pour une liste, " +
  "\"**texte**\" pour du gras, \"[texte](/lien)\" pour un lien, une ligne vide entre les " +
  "paragraphes. Pour un tableau, une ligne \"| Col A | Col B |\" suivie de \"| --- | --- |\" " +
  "puis des lignes de données. Le jeton {{gerer-cookies}} insère le bouton \"Gérer mes " +
  "cookies\" qui rouvre le bandeau de consentement.";

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
  const labels = FIELD_LABELS[item.cle] ?? { titre: "Titre", contenu: "Contenu" };
  const isLegal = LEGAL_BLOCKS.has(item.cle);

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
      <h2 className="font-semibold text-[#464746]">
        {BLOCK_TITLES[item.cle] ?? item.cle}
      </h2>
      {isLegal && (
        <p className="mt-2 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          Texte à valeur juridique (RGPD, mentions légales) — vérifiez sa conformité avant
          d&apos;enregistrer. {LEGAL_CONTENT_HELP}
        </p>
      )}
      <div className="mt-4 space-y-4">
        {!isLegal && (
          <div>
            <label className="block text-sm font-medium text-neutral-700">{labels.titre}</label>
            <input
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              className="mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-neutral-700">{labels.contenu}</label>
          <textarea
            value={contenu}
            onChange={(e) => setContenu(e.target.value)}
            rows={isLegal ? 24 : item.cle === "notre_histoire_cta" ? 2 : 5}
            className={`mt-1 w-full rounded border border-neutral-300 px-3 py-2 text-sm ${
              isLegal ? "font-mono text-xs" : ""
            }`}
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
