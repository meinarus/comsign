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
import { buttonVariants } from "@/components/ui/button";
import { LayoutDashboard, ScanLine, ShieldUser } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function SidebarNavMain({
  items,
  user,
}: {
  items: {
    title: string;
    url: string;
    icon: ElementType;
  }[];
  user:
    | {
        role?: string | null;
      }
    | undefined;
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
        <Separator className="bg-sidebar-border my-2" />
        <SidebarMenuItem className="flex justify-center">
          {user?.role === "admin" && (
            <Link
              href="/admin/dashboard"
              className={buttonVariants({
                variant: "outline",
              })}
            >
              <ShieldUser />
              Admin Dashboard
            </Link>
          )}
        </SidebarMenuItem>
        <SidebarMenuItem className="flex justify-center">
          <Link
            href="/scan"
            className={buttonVariants({
              variant: "outline",
            })}
          >
            <ScanLine />
            Scan
          </Link>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
