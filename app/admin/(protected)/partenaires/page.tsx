import PartnersManager from "@/components/admin/PartnersManager";

export default function AdminPartenairesPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-[#464746]">Partenaires locaux</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Gérez les partenaires affichés dans la section &quot;Nos partenaires locaux&quot; de la page d&apos;accueil.
      </p>
      <div className="mt-6">
        <PartnersManager />
      </div>
    </div>
  );
}
