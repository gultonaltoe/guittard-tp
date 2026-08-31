import type { MetadataRoute } from "next";
import { getPublicSupabase } from "@/lib/supabase";
import type { SiteSettings } from "@/lib/types";

// Interroge Supabase à chaque requête pour refléter l'état réel de la section
// Avis (activée ou non par Vincent), sans dépendre de la base au build Vercel.
export const dynamic = "force-dynamic";

const BASE_URL = "https://guittardtp.fr";

async function getAvisEnabled(): Promise<boolean> {
  try {
    const supabase = getPublicSupabase();
    const { data } = await supabase
      .from("site_settings")
      .select("avis_section_enabled")
      .eq("id", 1)
      .single();
    return (data as Pick<SiteSettings, "avis_section_enabled"> | null)?.avis_section_enabled ?? false;
  } catch {
    return false;
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const avisEnabled = await getAvisEnabled();
  const now = new Date();

  const entries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];

  if (avisEnabled) {
    entries.push({
      url: `${BASE_URL}/avis`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
