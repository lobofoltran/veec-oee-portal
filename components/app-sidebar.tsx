import * as React from "react";
import Link from "next/link";

import { NavUser } from "@/components/nav-user";
import { SidebarMenuTree } from "@/components/sidebar-menu-tree";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { getMenuTreeForRole } from "@/lib/menu/loader";

export type SidebarUser = {
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  role?: string | null;
};

export async function AppSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user?: SidebarUser;
}) {
  const menuTree = await getMenuTreeForRole(user?.role ?? undefined);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <Link href="/dashboard">
                <span className="text-base font-semibold">VEEC OEE Portal</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenuTree items={menuTree} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
