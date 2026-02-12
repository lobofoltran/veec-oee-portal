"use client";

import { useMemo, useState } from "react";
import type { MenuNode } from "@/lib/menu/loader";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, Folder, FolderOpen } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { resolveMenuIcon } from "@/components/menu-icons";

const STORAGE_KEY = "sidebar:folders:open";

type OpenState = Record<string, boolean>;

function collectFolderIds(items: MenuNode[], acc = new Set<string>()) {
  for (const item of items) {
    if (!item.href) {
      acc.add(item.id);
    }
    collectFolderIds(item.children, acc);
  }

  return acc;
}

function collectParentsOfActive(items: MenuNode[], pathname: string, parents: string[] = []): string[] {
  for (const item of items) {
    const isActive = item.href ? pathname === item.href || pathname.startsWith(`${item.href}/`) : false;

    if (isActive) {
      return parents;
    }

    const nested = collectParentsOfActive(item.children, pathname, !item.href ? [...parents, item.id] : parents);
    if (nested.length > 0) return nested;
  }

  return [];
}

function FolderItem({
  item,
  pathname,
  openState,
  setOpenState,
}: {
  item: MenuNode;
  pathname: string;
  openState: OpenState;
  setOpenState: (next: OpenState) => void;
}) {
  const isOpen = openState[item.id] ?? true;

  const toggle = () => {
    const next = {
      ...openState,
      [item.id]: !isOpen,
    };
    setOpenState(next);
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={toggle}
        className="font-semibold hover:bg-muted/70 data-[active=true]:bg-primary/10 data-[active=true]:text-primary"
        aria-expanded={isOpen}
      >
        {isOpen ? <ChevronDown className="size-4 transition-transform" /> : <ChevronRight className="size-4 transition-transform" />}
        {isOpen ? <FolderOpen className="size-4 text-primary" /> : <Folder className="size-4 text-primary" />}
        <span>{item.label}</span>
      </SidebarMenuButton>

      <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-[999px]" : "max-h-0"}`}>
        <SidebarMenuSub>
          {item.children.map((child) => (
            <MenuItem key={child.id} item={child} pathname={pathname} openState={openState} setOpenState={setOpenState} />
          ))}
        </SidebarMenuSub>
      </div>
    </SidebarMenuItem>
  );
}

function LeafItem({ item, pathname }: { item: MenuNode; pathname: string }) {
  const isActive = item.href ? pathname === item.href || pathname.startsWith(`${item.href}/`) : false;

  return (
    <SidebarMenuSubItem>
      <SidebarMenuSubButton asChild isActive={isActive} className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary">
        <Link href={item.href ?? "#"}>
          {resolveMenuIcon(item.icon)}
          <span>{item.label}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
}

function MenuItem({
  item,
  pathname,
  openState,
  setOpenState,
}: {
  item: MenuNode;
  pathname: string;
  openState: OpenState;
  setOpenState: (next: OpenState) => void;
}) {
  const isFolder = !item.href;

  if (isFolder) {
    return <FolderItem item={item} pathname={pathname} openState={openState} setOpenState={setOpenState} />;
  }

  if (item.children.length > 0) {
    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive} className="data-[active=true]:bg-primary/10 data-[active=true]:text-primary">
          <Link href={item.href ?? "#"}>
            {resolveMenuIcon(item.icon)}
            <span>{item.label}</span>
          </Link>
        </SidebarMenuButton>
        <SidebarMenuSub>
          {item.children.map((child) => (
            <MenuItem key={child.id} item={child} pathname={pathname} openState={openState} setOpenState={setOpenState} />
          ))}
        </SidebarMenuSub>
      </SidebarMenuItem>
    );
  }

  return <LeafItem item={item} pathname={pathname} />;
}

export function SidebarMenuTree({ items }: { items: MenuNode[] }) {
  const pathname = usePathname();
  const folderIds = useMemo(() => Array.from(collectFolderIds(items)), [items]);
  const activeParents = useMemo(() => collectParentsOfActive(items, pathname), [items, pathname]);

  const [openState, setOpenStateValue] = useState<OpenState>(() => {
    const defaultState = folderIds.reduce<OpenState>((acc, id) => {
      acc[id] = true;
      return acc;
    }, {});

    if (typeof window === "undefined") return defaultState;

    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;

    try {
      const parsed = JSON.parse(raw) as OpenState;
      return { ...defaultState, ...parsed };
    } catch {
      return defaultState;
    }
  });

  const hydratedOpenState = useMemo(() => {
    const state = { ...openState };
    activeParents.forEach((id) => {
      state[id] = true;
    });
    return state;
  }, [openState, activeParents]);

  const setOpenState = (next: OpenState) => {
    setOpenStateValue(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Menu</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <MenuItem key={item.id} item={item} pathname={pathname} openState={hydratedOpenState} setOpenState={setOpenState} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
