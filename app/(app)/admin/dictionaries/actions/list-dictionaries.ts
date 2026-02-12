import { prisma } from "@/lib/prisma";

export type ListDictionariesParams = {
  q: string;
  page: number;
  pageSize: number;
  sortBy: "name" | "createdAt" | "columns" | "active";
  sortDir: "asc" | "desc";
};

export async function listDictionariesAction(params: ListDictionariesParams) {
  const pageSize = Math.min(Math.max(params.pageSize, 1), 100);
  const requestedPage = Math.max(params.page, 1);

  const where = {
    isSystem: false,
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" as const } },
            { label: { contains: params.q, mode: "insensitive" as const } },
            { description: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const total = await prisma.dictionaryTable.count({ where });
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const page = Math.min(requestedPage, totalPages);

  const data = await prisma.dictionaryTable.findMany({
    where,
    include: {
      columns: true,
    },
    orderBy:
      params.sortBy === "columns"
        ? { createdAt: params.sortDir }
        : params.sortBy === "active"
          ? { isSystem: params.sortDir }
          : { [params.sortBy === "name" ? "label" : params.sortBy]: params.sortDir },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return {
    data: data.map((item) => ({
      ...item,
      active: !item.isSystem,
      columnsCount: item.columns.length,
    })),
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getDictionaryByIdAction(id: string) {
  return prisma.dictionaryTable.findUnique({
    where: { id },
    include: { columns: { orderBy: { order: "asc" } } },
  });
}
