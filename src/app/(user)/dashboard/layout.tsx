import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/user-dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/user-dashboard/dashboard-header";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <DashboardSidebar variant="inset" />
      <SidebarInset>
        <DashboardHeader />
        <div className="pt-4 md:pt-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
