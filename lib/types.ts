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
  partners_section_enabled: boolean;
  avis_section_enabled: boolean;
  updated_at: string;
}

export interface Partner {
  id: string;
  name: string;
  logo: string | null;
  website_url: string | null;
  description: string | null;
  position: number;
  status: "publie" | "masque";
  created_at: string;
}

export interface Review {
  id: string;
  author_name: string;
  author_city: string | null;
  rating: number;
  service_type: string | null;
  text: string;
  source: "manuel" | "formulaire";
  status: "en_attente" | "publie" | "masque";
  created_at: string;
  published_at: string | null;
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
