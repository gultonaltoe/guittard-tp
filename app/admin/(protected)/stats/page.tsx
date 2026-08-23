import Link from "next/link";
import { HardHat, Mail } from "lucide-react";
import { getAdminSupabase } from "@/lib/supabase";
import StatsPanel from "@/components/admin/StatsPanel";

export const dynamic = "force-dynamic";

async function getCounts() {
  const supabase = getAdminSupabase();
  const [{ count: realisationsPubliees }, { count: messagesNonLus }] = await Promise.all([
    supabase
      .from("realisations")
      .select("*", { count: "exact", head: true })
      .eq("publie", true),
    supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("lu", false),
  ]);
  return {
    realisationsPubliees: realisationsPubliees ?? 0,
    messagesNonLus: messagesNonLus ?? 0,
  };
}

export default async function AdminStatsPage() {
  const { realisationsPubliees, messagesNonLus } = await getCounts();

  return (
    <div>
      <h1 className="text-xl font-bold text-[#464746]">Stats</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Vue d&apos;ensemble de l&apos;activité, trafic du site et évolution des demandes de
        contact.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/realisations"
          className="group flex items-center gap-4 rounded-xl bg-white p-6 ring-1 ring-neutral-200 transition-shadow hover:shadow-md"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e9cc1b]/20 text-[#464746]">
            <HardHat size={22} strokeWidth={2} />
          </span>
          <div>
            <p className="text-3xl font-bold leading-none text-[#464746]">
              {realisationsPubliees}
            </p>
            <p className="mt-1 text-sm text-neutral-500 group-hover:text-[#464746]">
              Réalisation{realisationsPubliees > 1 ? "s" : ""} publiée
              {realisationsPubliees > 1 ? "s" : ""}
            </p>
          </div>
        </Link>

        <Link
          href="/admin/messages"
          className="group flex items-center gap-4 rounded-xl bg-white p-6 ring-1 ring-neutral-200 transition-shadow hover:shadow-md"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e9cc1b]/20 text-[#464746]">
            <Mail size={22} strokeWidth={2} />
          </span>
          <div>
            <p className="text-3xl font-bold leading-none text-[#464746]">{messagesNonLus}</p>
            <p className="mt-1 text-sm text-neutral-500 group-hover:text-[#464746]">
              Message{messagesNonLus > 1 ? "s" : ""} non lu{messagesNonLus > 1 ? "s" : ""}
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-8">
        <StatsPanel />
      </div>
    </div>
  );
}
