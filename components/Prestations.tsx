import { Shovel, Route, Fence, Trees } from "lucide-react";

const PRESTATIONS: {
  titre: string;
  accroche: string;
  description: string;
  categorie: string;
  Icon: typeof Shovel;
}[] = [
  {
    titre: "Terrassement",
    accroche: "Préparer et niveler votre terrain",
    description:
      "Préparation de terrain, fouilles, terrassement pour construction neuve, piscine ou assainissement.",
    categorie: "terrassement",
    Icon: Shovel,
  },
  {
    titre: "VRD",
    accroche: "Accès, réseaux et assainissement",
    description:
      "Voirie et réseaux divers : accès, assainissement, réseaux enterrés pour vos projets de construction.",
    categorie: "vrd",
    Icon: Route,
  },
  {
    titre: "Aménagements extérieurs",
    accroche: "Terrasses, allées et abords de piscine",
    description:
      "Terrasses, allées, dallages, escaliers extérieurs, abords de piscine : finitions soignées.",
    categorie: "amenagement_exterieur",
    Icon: Fence,
  },
  {
    titre: "Défrichage",
    accroche: "Débroussailler et dégager un terrain",
    description:
      "Débroussaillage et défrichage de terrains avant travaux ou pour l'entretien de vos parcelles.",
    categorie: "defrichage",
    Icon: Trees,
  },
];

export default function Prestations() {
  return (
    <section id="prestations" className="mx-auto max-w-6xl px-4 py-10 md:py-16">
      <h2 className="text-2xl font-bold text-[#464746] sm:text-3xl">
        Nos prestations
      </h2>
      <p className="mt-2 max-w-2xl text-neutral-600">
        Une équipe équipée pour intervenir sur tous types de chantiers, du
        particulier au professionnel.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 sm:gap-6 md:mt-10 lg:grid-cols-4">
        {PRESTATIONS.map((p) => (
          <a
            key={p.titre}
            href={`/?type=${p.categorie}#realisations`}
            className="block rounded-lg border border-neutral-200 p-4 transition-all duration-150 hover:-translate-y-0.5 hover:border-[#e9cc1b] hover:shadow-md sm:p-6"
          >
            <div className="flex items-center gap-3 sm:block">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9cc1b] sm:mb-4">
                <p.Icon className="h-5 w-5 text-[#464746]" strokeWidth={2} />
              </div>
              <h3 className="font-semibold text-[#464746]">{p.titre}</h3>
            </div>
            <p className="mt-1 text-sm font-medium text-neutral-500">
              {p.accroche}
            </p>
            <p className="mt-1.5 text-sm text-neutral-600 sm:mt-3">
              {p.description}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
