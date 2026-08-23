export interface TypeRealisation {
  slug: string;
  label: string;
  position: number;
}

export interface Realisation {
  id: string;
  titre: string;
  description: string | null;
  categorie: string;
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

export interface ContenuSite {
  id: string;
  cle: string;
  titre: string | null;
  contenu: string | null;
  updated_at: string;
}
