import { usePathname } from "next/navigation";
import Link from "next/link";
import type { ElementType } from "react";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { LayoutDashboard } from "lucide-react";

export function SidebarNavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: ElementType;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="gap-1">
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild isActive={pathname === "/admin/dashboard"}>
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <LayoutDashboard />
              Dashboard
            </Link>
          </SidebarMenuButton>

          <SidebarMenuSub className="gap-2">
            {items.map(({ title, url, icon: Icon }) => (
              <SidebarMenuSubItem key={title}>
                <SidebarMenuSubButton asChild isActive={pathname === url}>
                  <Link href={url} className="flex items-center gap-2">
                    <Icon />
                    <span>{title}</span>
                  </Link>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
