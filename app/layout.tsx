import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { getPublicSupabase } from "@/lib/supabase";
import type { SiteSettings } from "@/lib/types";
import "./globals.css";

// Le JSON-LD (areaServed) interroge Supabase à chaque requête : pas de rendu
// statique, pour rester à jour si Vincent modifie la zone d'intervention.
export const dynamic = "force-dynamic";

const DEFAULT_ZONE_INTERVENTION = "Haut-Rhin et environs";

async function getZoneIntervention(): Promise<string> {
  try {
    const supabase = getPublicSupabase();
    const { data } = await supabase
      .from("site_settings")
      .select("zone_intervention")
      .eq("id", 1)
      .single();
    return (
      (data as Pick<SiteSettings, "zone_intervention"> | null)?.zone_intervention ??
      DEFAULT_ZONE_INTERVENTION
    );
  } catch {
    return DEFAULT_ZONE_INTERVENTION;
  }
}

export const metadata: Metadata = {
  metadataBase: new URL("https://guittardtp.fr"),
  title: "Guittard TP & Terrassement - Terrassement, VRD, aménagements extérieurs | Haut-Rhin",
  description:
    "Entreprise de terrassement, VRD, aménagements extérieurs et défrichage à Sternenberg (Haut-Rhin). Devis gratuit pour vos travaux publics et particuliers.",
  keywords: [
    "terrassement Haut-Rhin",
    "VRD Sternenberg",
    "aménagement extérieur",
    "défrichage",
    "entreprise terrassement 68",
    "Guittard TP",
  ],
  openGraph: {
    title: "Guittard TP & Terrassement",
    description:
      "Terrassement, VRD, aménagements extérieurs et défrichage dans le Haut-Rhin.",
    url: "https://guittardtp.fr",
    siteName: "Guittard TP & Terrassement",
    locale: "fr_FR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Guittard TP & Terrassement",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Guittard TP & Terrassement",
    description:
      "Terrassement, VRD, aménagements extérieurs et défrichage dans le Haut-Rhin.",
    images: ["/og-image.png"],
  },
  robots: "index, follow",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const zoneIntervention = await getZoneIntervention();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    name: "Guittard TP & Terrassement",
    telephone: "+33666822418",
    url: "https://guittardtp.fr",
    description:
      "Entreprise de terrassement, VRD, aménagements extérieurs et défrichage à Sternenberg (Haut-Rhin).",
    areaServed: zoneIntervention,
  };

  return (
    <html lang="fr">
      <body className="antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
