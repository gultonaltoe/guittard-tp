"use client";

import { type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  HardHat,
  Mail,
  FileText,
  MapPin,
  LogOut,
} from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/realisations", label: "Réalisations", icon: HardHat },
  { href: "/admin/messages", label: "Messages", icon: Mail },
  { href: "/admin/contenu", label: "Textes du site", icon: FileText },
  { href: "/admin/coordonnees", label: "Coordonnées", icon: MapPin },
];

export default function AdminShell({
  userEmail,
  children,
}: {
  userEmail: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  async function handleLogout() {
    const supabase = getBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-[#3c3d3c] md:flex">
        <div className="flex items-center gap-2 px-5 py-6">
          <Image
            src="/logo-guittard-badge.png"
            alt=""
            aria-hidden="true"
            width={36}
            height={36}
          />
          <div className="leading-tight">
            <p className="text-sm font-bold text-white">Guittard TP</p>
            <p className="text-xs text-neutral-400">Espace admin</p>
          </div>
        </div>
        <nav className="mt-2 flex flex-1 flex-col gap-1 px-3">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-[#4a4b4a] text-[#e9cc1b]"
                    : "text-neutral-300 hover:bg-[#454645] hover:text-white"
                }`}
              >
                <Icon size={18} strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 px-3 py-4">
          <p className="truncate px-3 text-xs text-neutral-400" title={userEmail}>
            {userEmail}
          </p>
          <button
            onClick={handleLogout}
            className="mt-2 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-neutral-300 hover:bg-[#454645] hover:text-white"
          >
            <LogOut size={18} strokeWidth={2} />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-[#3c3d3c] md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Image
              src="/logo-guittard-badge.png"
              alt=""
              aria-hidden="true"
              width={30}
              height={30}
            />
            <span className="text-sm font-bold text-white">Espace admin</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium text-neutral-300 hover:text-white"
          >
            <LogOut size={16} strokeWidth={2} />
            Déconnexion
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                  active
                    ? "bg-[#e9cc1b] text-[#3c3d3c]"
                    : "bg-[#4a4b4a] text-neutral-200"
                }`}
              >
                <Icon size={14} strokeWidth={2} />
                {label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Content */}
      <main className="px-4 py-6 md:ml-60 md:px-10 md:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
