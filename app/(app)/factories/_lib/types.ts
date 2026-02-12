import type { Factory as PrismaFactory } from "@/lib/generated/prisma/client"
import type { z } from "zod"

import type {
  createFactorySchema,
  factoryFormSchema,
  updateFactorySchema,
} from "./schema"

export type Factory = PrismaFactory

export type FactoryFormInput = z.input<typeof factoryFormSchema>
export type CreateFactoryInput = z.output<typeof createFactorySchema>
export type UpdateFactoryInput = z.output<typeof updateFactorySchema>

export type FactoryActiveFilter = "all" | "active" | "inactive"

export type FactoryFieldName = keyof FactoryFormInput
export type FactoryFieldErrors = Partial<Record<FactoryFieldName, string[]>>

export type FactoryListItem = Pick<
  Factory,
  "id" | "code" | "name" | "city" | "state" | "isActive" | "updatedAt"
>

export type ListFactoriesParams = {
  search?: string
  active?: FactoryActiveFilter
  page?: number
  pageSize?: number
}

export type ListFactoriesResult = {
  data: FactoryListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type FactoryMutationResult =
  | {
      ok: true
      id: string
    }
  | {
      ok: false
      fieldErrors?: FactoryFieldErrors
      formError?: string
    }

export type FactoryDeleteResult =
  | {
      ok: true
    }
  | {
      ok: false
      formError: string
    }
