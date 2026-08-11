import ContenuManager from "@/components/admin/ContenuManager";

export default function AdminContenuPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-[#464746]">Textes du site</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Modifiez les textes affichés sur les différentes sections du site.
      </p>
      <div className="mt-6">
        <ContenuManager />
      </div>
    </div>
  );
}
