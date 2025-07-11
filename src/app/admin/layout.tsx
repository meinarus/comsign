import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/admin/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/admin/dashboard/dashboard-header";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/get-session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    return redirect("/login");
  }

  if (session.user.role !== "admin") {
    return redirect("/");
  }

  const user = session.user;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <DashboardSidebar variant="inset" user={user} />
      <SidebarInset>
        <DashboardHeader />
        <div className="pt-4 md:pt-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
