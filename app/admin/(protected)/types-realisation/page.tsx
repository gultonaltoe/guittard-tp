import TypesRealisationManager from "@/components/admin/TypesRealisationManager";

export default function AdminTypesRealisationPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-[#464746]">Types de réalisations</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Gérez les catégories utilisées pour classer les réalisations et filtrer la page publique.
      </p>
      <div className="mt-6">
        <TypesRealisationManager />
      </div>
    </div>
  );
}
