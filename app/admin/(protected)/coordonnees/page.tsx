import CoordonneesManager from "@/components/admin/CoordonneesManager";

export default function AdminCoordonneesPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-[#464746]">Coordonnées</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Téléphone, email et adresse affichés sur le site public.
      </p>
      <div className="mt-6">
        <CoordonneesManager />
      </div>
    </div>
  );
}
