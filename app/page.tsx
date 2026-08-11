import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Prestations from "@/components/Prestations";
import NotreHistoire from "@/components/NotreHistoire";
import Realisations from "@/components/Realisations";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { getPublicSupabase } from "@/lib/supabase";
import type { ContenuSite, Realisation, SiteSettings } from "@/lib/types";

// Cette page interroge Supabase à chaque requête : pas de rendu statique,
// donc aucune dépendance à la base de données pendant le build Vercel.
export const dynamic = "force-dynamic";

const DEFAULT_SETTINGS: SiteSettings = {
  id: 1,
  telephone: "06 66 82 24 18",
  email: "contact@guittardtp.fr",
  adresse: "38 rue Principale, 68780 Sternenberg",
  zone_intervention: "Haut-Rhin et environs",
  updated_at: new Date().toISOString(),
};

const DEFAULT_NOTRE_HISTOIRE = {
  titre: "Notre histoire",
  contenu:
    "[Texte à personnaliser par Vincent, son parcours, la création de l'entreprise, ses valeurs]",
};

async function getData() {
  try {
    const supabase = getPublicSupabase();
    const [{ data: realisations }, { data: settings }, { data: contenus }] =
      await Promise.all([
        supabase
          .from("realisations")
          .select("*")
          .eq("publie", true)
          .order("position", { ascending: true }),
        supabase.from("site_settings").select("*").eq("id", 1).single(),
        supabase.from("contenu_site").select("*"),
      ]);
    return {
      realisations: (realisations as Realisation[]) ?? [],
      settings: (settings as SiteSettings) ?? DEFAULT_SETTINGS,
      contenus: (contenus as ContenuSite[]) ?? [],
    };
  } catch {
    // Si Supabase est momentanément indisponible ou mal configuré, le site
    // reste consultable avec les coordonnées par défaut plutôt que de planter.
    return {
      realisations: [] as Realisation[],
      settings: DEFAULT_SETTINGS,
      contenus: [] as ContenuSite[],
    };
  }
}

export default async function HomePage() {
  const { realisations, settings, contenus } = await getData();
  const notreHistoire = contenus.find((c) => c.cle === "notre_histoire");
  return (
    <>
      <Header telephone={settings.telephone} />
      <main>
        <Hero telephone={settings.telephone} />
        <Prestations />
        <section id="notre-histoire">
          <NotreHistoire
            titre={notreHistoire?.titre ?? DEFAULT_NOTRE_HISTOIRE.titre}
            contenu={notreHistoire?.contenu ?? DEFAULT_NOTRE_HISTOIRE.contenu}
          />
        </section>
        <Realisations realisations={realisations} />
        <Contact settings={settings} />
      </main>
      <Footer settings={settings} />
    </>
  );
}
