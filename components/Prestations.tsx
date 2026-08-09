const PRESTATIONS = [
  {
    titre: "Terrassement",
    accroche: "Préparer et niveler votre terrain",
    description:
      "Préparation de terrain, fouilles, terrassement pour construction neuve, piscine ou assainissement.",
  },
  {
    titre: "VRD",
    accroche: "Accès, réseaux et assainissement",
    description:
      "Voirie et réseaux divers : accès, assainissement, réseaux enterrés pour vos projets de construction.",
  },
  {
    titre: "Aménagements extérieurs",
    accroche: "Terrasses, allées et abords de piscine",
    description:
      "Terrasses, allées, dallages, escaliers extérieurs, abords de piscine : finitions soignées.",
  },
  {
    titre: "Défrichage",
    accroche: "Débroussailler et dégager un terrain",
    description:
      "Débroussaillage et défrichage de terrains avant travaux ou pour l'entretien de vos parcelles.",
  },
];

export default function Prestations() {
  return (
    <section id="prestations" className="mx-auto max-w-6xl px-4 py-20">
      <h2 className="text-2xl font-bold text-[#1c1f22] sm:text-3xl">
        Nos prestations
      </h2>
      <p className="mt-2 max-w-2xl text-neutral-600">
        Une équipe équipée pour intervenir sur tous types de chantiers, du
        particulier au professionnel.
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {PRESTATIONS.map((p) => (
          <div
            key={p.titre}
            className="rounded-lg border border-neutral-200 p-6 transition hover:border-[#f4c430] hover:shadow-sm"
          >
            <div className="mb-4 h-1 w-10 rounded bg-[#f4c430]" />
            <h3 className="font-semibold text-[#1c1f22]">{p.titre}</h3>
            <p className="mt-1 text-sm font-medium text-neutral-500">
              {p.accroche}
            </p>
            <p className="mt-3 text-sm text-neutral-600">{p.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
