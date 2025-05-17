"use client";

import * as React from "react";

import { SidebarNavMain } from "@/components/admin/dashboard/sidebar-main";
import { SidebarNavUser } from "@/components/admin/dashboard/sidebar-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import Link from "next/link";
import { ScanLine, Users } from "lucide-react";

const navMain = [
  {
    title: "Users",
    url: "/admin/dashboard/users",
    icon: Users,
  },
];

interface DashboardSidebarProps {
  user:
    | {
        name: string;
        email: string;
        image?: string | null;
        role?: string | null;
      }
    | undefined;
}

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar> & DashboardSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link href="/" className="flex items-center gap-3">
                <ScanLine className="!h-6 !w-6" />
                <span className="text-xl font-semibold">ComSign</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarNavUser user={props.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
