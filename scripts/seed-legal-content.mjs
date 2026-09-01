// One-off / idempotent seed: crée les lignes contenu_site pour les pages
// légales (mentions_legales, politique_confidentialite) si elles n'existent
// pas déjà, avec le texte par défaut de lib/legalContentDefaults.ts.
// Nécessaire car l'admin (PATCH /api/admin/contenu) ne fait qu'un UPDATE,
// pas d'upsert : les lignes doivent exister avant la première édition.
//
// Usage : node scripts/seed-legal-content.mjs
// Lit NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY depuis .env.local.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const rootDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function loadEnvLocal() {
  const envPath = path.join(rootDir, ".env.local");
  const content = readFileSync(envPath, "utf8");
  const env = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    env[trimmed.slice(0, eq)] = trimmed.slice(eq + 1);
  }
  return env;
}

const env = loadEnvLocal();
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error("Variables Supabase manquantes dans .env.local");
  process.exit(1);
}

// lib/legalContentDefaults.ts n'est pas exécutable tel quel par Node (TS) ;
// on relit directement le fichier source pour en extraire les deux constantes.
const legalDefaultsSrc = readFileSync(
  path.join(rootDir, "lib", "legalContentDefaults.ts"),
  "utf8"
);
function extractTemplateConst(name) {
  const marker = `export const ${name} = \``;
  const start = legalDefaultsSrc.indexOf(marker);
  if (start === -1) throw new Error(`Constante ${name} introuvable`);
  const bodyStart = start + marker.length;
  const end = legalDefaultsSrc.indexOf("`;", bodyStart);
  return legalDefaultsSrc.slice(bodyStart, end);
}
const DEFAULT_MENTIONS_LEGALES = extractTemplateConst("DEFAULT_MENTIONS_LEGALES");
const DEFAULT_POLITIQUE_CONFIDENTIALITE = extractTemplateConst(
  "DEFAULT_POLITIQUE_CONFIDENTIALITE"
);

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

const rows = [
  { cle: "mentions_legales", titre: null, contenu: DEFAULT_MENTIONS_LEGALES },
  { cle: "politique_confidentialite", titre: null, contenu: DEFAULT_POLITIQUE_CONFIDENTIALITE },
];

for (const row of rows) {
  const { data: existing, error: selectError } = await supabase
    .from("contenu_site")
    .select("cle")
    .eq("cle", row.cle)
    .maybeSingle();

  if (selectError) {
    console.error(`Erreur lecture ${row.cle}:`, selectError.message);
    process.exit(1);
  }

  if (existing) {
    console.log(`- ${row.cle} : déjà présent, ignoré.`);
    continue;
  }

  const { error: insertError } = await supabase.from("contenu_site").insert(row);
  if (insertError) {
    console.error(`Erreur insertion ${row.cle}:`, insertError.message);
    process.exit(1);
  }
  console.log(`- ${row.cle} : inséré.`);
}

console.log("Terminé.");
