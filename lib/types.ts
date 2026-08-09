export type Categorie =
  | "terrassement"
  | "vrd"
  | "amenagement_exterieur"
  | "defrichage";

export const CATEGORIES: { value: Categorie; label: string }[] = [
  { value: "terrassement", label: "Terrassement" },
  { value: "vrd", label: "VRD" },
  { value: "amenagement_exterieur", label: "Aménagements extérieurs" },
  { value: "defrichage", label: "Défrichage" },
];

export interface Realisation {
  id: string;
  titre: string;
  description: string | null;
  categorie: Categorie;
  photos: string[];
  position: number;
  publie: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: number;
  telephone: string;
  email: string;
  adresse: string;
  zone_intervention: string;
  updated_at: string;
}

export interface ContactMessage {
  id: string;
  nom: string;
  email: string;
  telephone: string | null;
  message: string;
  lu: boolean;
  created_at: string;
}
