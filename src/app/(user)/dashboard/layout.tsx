"use client";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/user/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/user/dashboard/dashboard-header";
import { authClient } from "@/lib/auth-client";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = authClient.useSession();

  if (!session) return null;

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <DashboardSidebar variant="inset" user={session.user} />
      <SidebarInset>
        <DashboardHeader />
        <div className="pt-4 md:pt-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
