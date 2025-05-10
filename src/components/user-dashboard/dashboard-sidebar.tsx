"use client";

import * as React from "react";

import { SidebarNavMain } from "@/components/user-dashboard/sidebar-main";
import { SidebarNavUser } from "@/components/user-dashboard/sidebar-user";
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
import { ClipboardList, ScanLine, Users } from "lucide-react";

const data = {
  user: {
    name: "Test User",
    email: "testuser@email.com",
    avatar: "/",
  },
  navMain: [
    {
      title: "Attendance",
      url: "/dashboard/attendance",
      icon: ClipboardList,
    },
    {
      title: "Students",
      url: "/dashboard/students",
      icon: Users,
    },
  ],
};

export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
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
        <SidebarNavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarNavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
