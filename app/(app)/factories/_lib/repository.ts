import type { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"

import type {
  CreateFactoryInput,
  Factory,
  FactoryActiveFilter,
  ListFactoriesParams,
  ListFactoriesResult,
  UpdateFactoryInput,
} from "./types"

function buildFactoryFilter(search?: string, active?: FactoryActiveFilter) {
  const where: Prisma.FactoryWhereInput = {}

  if (active === "active") {
    where.isActive = true
  } else if (active === "inactive") {
    where.isActive = false
  }

  if (search) {
    where.OR = [
      {
        code: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
    ]
  }

  return where
}

export async function listFactories(
  params: ListFactoriesParams = {}
): Promise<ListFactoriesResult> {
  const pageSize = Math.min(Math.max(params.pageSize ?? 10, 1), 100)
  const requestedPage = Math.max(params.page ?? 1, 1)

  const where = buildFactoryFilter(params.search, params.active)
  const total = await prisma.factory.count({ where })
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize)
  const page = Math.min(requestedPage, totalPages)
  const skip = (page - 1) * pageSize

  const data = await prisma.factory.findMany({
    where,
    select: {
      id: true,
      code: true,
      name: true,
      city: true,
      state: true,
      isActive: true,
      updatedAt: true,
    },
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
    skip,
    take: pageSize,
  })

  return {
    data,
    total,
    page,
    pageSize,
    totalPages,
  }
}

export async function getFactoryById(id: string): Promise<Factory | null> {
  return prisma.factory.findUnique({
    where: { id },
  })
}

export async function createFactory(data: CreateFactoryInput): Promise<Factory> {
  return prisma.factory.create({
    data,
  })
}

export async function updateFactory(
  id: string,
  data: UpdateFactoryInput
): Promise<Factory> {
  return prisma.factory.update({
    where: { id },
    data,
  })
}

export async function deleteFactory(id: string): Promise<void> {
  await prisma.factory.delete({
    where: { id },
  })
}
