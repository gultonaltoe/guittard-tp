import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/supabase/server";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();
  if (!user) {
    redirect("/admin/login");
  }
  return <AdminShell userEmail={user.email ?? ""}>{children}</AdminShell>;
}
