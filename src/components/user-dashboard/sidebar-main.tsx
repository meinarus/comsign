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
import { Button } from "@/components/ui/button";
import { LayoutDashboard, ScanLine } from "lucide-react";
import { Separator } from "@/components/ui/separator";

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
          <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
            <Link href="/dashboard" className="flex items-center gap-2">
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

        <Separator className="my-2" />
        <SidebarMenuItem className="flex justify-center">
          <Button asChild variant="outline">
            <Link href="/scan" className="flex items-center gap-2">
              <ScanLine />
              <span>Scan Now</span>
            </Link>
          </Button>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
