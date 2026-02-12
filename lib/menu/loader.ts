import type { Menu, MenuAccessRole } from "@/lib/generated/prisma/client";
import { ensureDefaultMenus } from "@/lib/menu/bootstrap";
import { prisma } from "@/lib/prisma";

export type MenuNode = Menu & { children: MenuNode[] };

export function buildMenuTree(items: Menu[]): MenuNode[] {
  const map = new Map<string, MenuNode>();
  const roots: MenuNode[] = [];

  for (const item of items) {
    map.set(item.id, { ...item, children: [] });
  }

  for (const item of items) {
    const node = map.get(item.id);
    if (!node) continue;

    if (!item.parentId) {
      roots.push(node);
      continue;
    }

    const parent = map.get(item.parentId);
    if (!parent) {
      roots.push(node);
      continue;
    }

    if (createsCycle(map, item.id, item.parentId)) {
      continue;
    }

    parent.children.push(node);
  }

  const sortTree = (nodes: MenuNode[]) => {
    nodes.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
    nodes.forEach((node) => sortTree(node.children));
  };

  sortTree(roots);
  return roots;
}

function createsCycle(map: Map<string, MenuNode>, childId: string, parentId: string) {
  let current: string | null = parentId;

  while (current) {
    if (current === childId) return true;
    const node = map.get(current);
    current = node?.parentId ?? null;
  }

  return false;
}

export async function getMenuTreeForRole(role?: string) {
  await ensureDefaultMenus();
  const menuItems = await prisma.menu.findMany({
    where: { enabled: true },
    include: { roles: true },
    orderBy: [{ order: "asc" }, { label: "asc" }],
  });

  const parsedRole = (["ADMIN", "MANAGER", "OPERATOR", "USER"].includes(role ?? "")
    ? role
    : null) as MenuAccessRole | null;
  const filtered = menuItems.filter((item) => {
    if (item.roles.length === 0) return true;
    if (!parsedRole) return false;
    return item.roles.some((menuRole) => menuRole.role === parsedRole);
  });

  return buildMenuTree(filtered.map(({ roles: _roles, ...menu }) => menu));
}
