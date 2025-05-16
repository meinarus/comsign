"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

const routes = [
  {
    name: "Dashboard",
    path: "/dashboard",
    description: "Overview of your dashboard",
  },
  {
    name: "Attendance",
    path: "/dashboard/attendance",
    description: "View and manage attendance records",
  },
  {
    name: "Students",
    path: "/dashboard/students",
    description: "View and manage student information",
  },
];

export function DashboardHeader() {
  const pathname = usePathname();
  const title = routes.find((r) => pathname === r.path)!.name;
  const description = routes.find((r) => pathname === r.path)!.description;

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 md:hidden" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4 md:hidden"
        />
        <div className="flex items-center gap-2">
          <h1 className="text-base font-medium md:text-lg">{title}</h1>
          <Separator
            orientation="vertical"
            className="mx-2 hidden data-[orientation=vertical]:h-5 md:block"
          />
          <p className="text-muted-foreground hidden md:block">{description}</p>
        </div>
      </div>
    </header>
  );
}
