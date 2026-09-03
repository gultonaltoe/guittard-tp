import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AvisListe from "@/components/AvisListe";
import AvisForm from "@/components/AvisForm";
import StarRating from "@/components/StarRating";
import { getPublicSupabase } from "@/lib/supabase";
import { computeAverageRating } from "@/lib/reviews";
import type { Review, SiteSettings, TypeRealisation } from "@/lib/types";

export const dynamic = "force-dynamic";

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
  const supabase = getPublicSupabase();
  const [{ data: settings }, { data: reviews }, { data: types }] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).single(),
    supabase
      .from("reviews")
      .select("*")
      .eq("status", "publie")
      .order("created_at", { ascending: false }),
    supabase.from("types_realisation").select("*").order("position", { ascending: true }),
  ]);
  return {
    settings: (settings as SiteSettings) ?? DEFAULT_SETTINGS,
    reviews: (reviews as Review[]) ?? [],
    types: (types as TypeRealisation[]) ?? [],
  };
}

export default async function AvisPage() {
  const { settings, reviews, types } = await getData();

  // La page n'existe pas tant que Vincent n'a pas activé la section, pour
  // éviter qu'elle soit accessible par URL directe avant l'activation.
  if (!settings.avis_section_enabled) {
    notFound();
  }

  const { average, count } = computeAverageRating(reviews);

  return (
    <>
      <Header />
      <main>
        <section className="bg-[#464746] px-4 py-10 md:py-16">
          <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-8">
            <div className="max-w-2xl">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#e9cc1b]">
                <span className="h-[3px] w-4 bg-[#e9cc1b]" aria-hidden="true" />
                Avis clients
              </p>
              <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Avis de nos clients
              </h1>
              <p className="mt-2 text-neutral-300">
                Retours de clients sur nos chantiers de terrassement, VRD, aménagements extérieurs
                et défrichage dans le Haut-Rhin.
              </p>
            </div>
            {count > 0 && (
              <div className="flex flex-col items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-6 py-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-white">
                    {average.toLocaleString("fr-FR", {
                      minimumFractionDigits: 1,
                      maximumFractionDigits: 1,
                    })}
                  </span>
                  <span className="text-sm text-neutral-300">/ 5</span>
                </div>
                <StarRating rating={Math.round(average)} />
                <span className="text-xs text-neutral-400">{count} avis</span>
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 md:py-16">
          {reviews.length > 0 ? (
            <AvisListe reviews={reviews} types={types} />
          ) : (
            <p className="text-sm text-neutral-500">
              Les avis seront bientôt publiés ici.
            </p>
          )}
        </section>

        <section className="bg-neutral-100 px-4 py-10 md:py-16">
          <AvisForm types={types} />
        </section>
      </main>
      <Footer settings={settings} />
    </>
  );
}
