import StatsPanel from "@/components/admin/StatsPanel";

export default function AdminStatsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-[#464746]">Stats</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Trafic du site et évolution des demandes de contact.
      </p>
      <div className="mt-6">
        <StatsPanel />
      </div>
    </div>
  );
}
