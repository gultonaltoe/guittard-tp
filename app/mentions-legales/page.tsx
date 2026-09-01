import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getPublicSupabase } from "@/lib/supabase";
import { renderLegalMarkdown } from "@/lib/renderLegalMarkdown";
import { DEFAULT_MENTIONS_LEGALES } from "@/lib/legalContentDefaults";
import type { ContenuSite, SiteSettings } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mentions légales | Guittard TP & Terrassement",
  description: "Mentions légales du site Guittard TP & Terrassement.",
  robots: "index, follow",
};

const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  telephone: "06 66 82 24 18",
  email: "contact@guittardtp.fr",
  adresse: "38 rue Principale, 68780 Sternenberg",
  zone_intervention: "Haut-Rhin et environs",
  partners_section_enabled: false,
  avis_section_enabled: false,
  updated_at: new Date().toISOString(),
};

async function getData() {
  try {
    const supabase = getPublicSupabase();
    const [{ data: settings }, { data: contenu }] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).single(),
      supabase.from("contenu_site").select("*").eq("cle", "mentions_legales").single(),
    ]);
    return {
      settings: (settings as SiteSettings) ?? DEFAULT_SETTINGS,
      contenu: (contenu as ContenuSite | null)?.contenu ?? null,
    };
  } catch {
    return { settings: DEFAULT_SETTINGS, contenu: null };
  }
}

export default async function MentionsLegalesPage() {
  const { settings, contenu } = await getData();

  return (
    <>
      <Header />
      <main>
        <section className="bg-[#464746] px-4 py-10 md:py-16">
          <div className="mx-auto max-w-3xl">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#e9cc1b]">
              <span className="h-[3px] w-4 bg-[#e9cc1b]" aria-hidden="true" />
              Informations légales
            </p>
            <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              Mentions légales
            </h1>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-10 md:py-16 text-neutral-700">
          {renderLegalMarkdown(contenu || DEFAULT_MENTIONS_LEGALES)}
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
