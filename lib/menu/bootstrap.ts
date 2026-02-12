import { prisma } from "@/lib/prisma";

export async function ensureDefaultMenus() {
  const count = await prisma.menu.count();
  if (count > 0) return;

  const dashboard = await prisma.menu.create({
    data: {
      label: "Dashboard",
      icon: "dashboard",
      href: "/dashboard",
      order: 1,
      enabled: true,
    },
  });

  const cadastros = await prisma.menu.create({
    data: {
      label: "Cadastros",
      icon: "database",
      order: 20,
      enabled: true,
    },
  });

  const factories = await prisma.menu.create({
    data: {
      label: "Fábricas",
      icon: "database",
      href: "/factories",
      parentId: cadastros.id,
      order: 1,
      enabled: true,
    },
  });

  const users = await prisma.menu.create({
    data: {
      label: "Usuários",
      icon: "users",
      href: "/users",
      parentId: cadastros.id,
      order: 2,
      enabled: true,
    },
  });

  const admin = await prisma.menu.create({
    data: {
      label: "Admin",
      icon: "settings",
      href: null,
      order: 100,
      enabled: true,
    },
  });

  const dictionary = await prisma.menu.create({
    data: {
      label: "Dictionary",
      icon: "database",
      href: "/admin/dictionaries",
      parentId: admin.id,
      order: 1,
      enabled: true,
    },
  });

  const menus = await prisma.menu.create({
    data: {
      label: "Menus",
      icon: "menu",
      href: "/menus",
      parentId: admin.id,
      order: 2,
      enabled: true,
    },
  });

  await prisma.menuRole.createMany({
    data: [
      { menuId: dashboard.id, role: "ADMIN" },
      { menuId: cadastros.id, role: "ADMIN" },
      { menuId: factories.id, role: "ADMIN" },
      { menuId: users.id, role: "ADMIN" },
      { menuId: cadastros.id, role: "MANAGER" },
      { menuId: factories.id, role: "MANAGER" },
      { menuId: users.id, role: "MANAGER" },
      { menuId: admin.id, role: "ADMIN" },
      { menuId: dictionary.id, role: "ADMIN" },
      { menuId: menus.id, role: "ADMIN" },
    ],
  });
}
