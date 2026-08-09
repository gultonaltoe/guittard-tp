import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import DashboardShell from "./DashboardShell";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
  return <DashboardShell />;
}
