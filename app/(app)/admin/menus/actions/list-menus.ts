import { prisma } from "@/lib/prisma";

import type { Menu } from "@/lib/generated/prisma/client";

type ListParams = {
  q: string;
  page: number;
  pageSize: number;
  sortBy: "label" | "href" | "order" | "enabled";
  sortDir: "asc" | "desc";
};

export type MenuListItem = Menu & {
  folderName: string | null;
  isFolder: boolean;
};

export type ListMenusResult = {
  data: MenuListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export async function listMenusAction(params: ListParams): Promise<ListMenusResult> {
  const pageSize = Math.min(Math.max(params.pageSize, 1), 100);
  const requestedPage = Math.max(params.page, 1);

  const where = params.q
    ? {
        OR: [
          { label: { contains: params.q, mode: "insensitive" as const } },
          { href: { contains: params.q, mode: "insensitive" as const } },
          { icon: { contains: params.q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const total = await prisma.menu.count({ where });
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const page = Math.min(requestedPage, totalPages);

  const orderBy: Record<string, "asc" | "desc"> = {
    [params.sortBy]: params.sortDir,
  };

  const items = await prisma.menu.findMany({
    where,
    include: {
      parent: {
        select: {
          label: true,
        },
      },
    },
    orderBy: [orderBy, { label: "asc" }],
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return {
    data: items.map((item) => ({
      ...item,
      folderName: item.parent?.label ?? null,
      isFolder: !item.href,
    })),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function listFoldersAction() {
  return prisma.menu.findMany({
    where: { href: null },
    orderBy: [{ order: "asc" }, { label: "asc" }],
  });
}
