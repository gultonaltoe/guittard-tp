"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RealisationsManager from "./RealisationsManager";
import MessagesInbox from "./MessagesInbox";

type Tab = "realisations" | "messages";

export default function DashboardShell() {
  const [tab, setTab] = useState<Tab>("realisations");
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-lg font-bold text-[#1c1f22]">
            Espace admin · Guittard TP
          </h1>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-neutral-500 hover:text-[#1c1f22]"
          >
            Se déconnecter
          </button>
        </div>
        <div className="mx-auto flex max-w-5xl gap-1 px-4">
          <button
            onClick={() => setTab("realisations")}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === "realisations"
                ? "border-[#f4c430] text-[#1c1f22]"
                : "border-transparent text-neutral-500 hover:text-[#1c1f22]"
            }`}
          >
            Réalisations
          </button>
          <button
            onClick={() => setTab("messages")}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              tab === "messages"
                ? "border-[#f4c430] text-[#1c1f22]"
                : "border-transparent text-neutral-500 hover:text-[#1c1f22]"
            }`}
          >
            Messages
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        {tab === "realisations" ? <RealisationsManager /> : <MessagesInbox />}
      </main>
    </div>
  );
}
