import RealisationsManager from "@/components/admin/RealisationsManager";

export default function AdminRealisationsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-[#464746]">Réalisations</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Ajoutez, publiez ou masquez les chantiers présentés sur le site.
      </p>
      <div className="mt-6">
        <RealisationsManager />
      </div>
    </div>
  );
}
