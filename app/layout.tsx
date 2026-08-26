import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
