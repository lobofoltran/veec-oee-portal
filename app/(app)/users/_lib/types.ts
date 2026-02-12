import type { User as PrismaUser } from "@/lib/generated/prisma/client"
import type { z } from "zod"

import type {
  changePasswordSchema,
  createUserFormSchema,
  updateUserFormSchema,
} from "./schema"

export type User = PrismaUser
export type UserRoleName = "ADMIN" | "MANAGER" | "OPERATOR"
export type UserActiveFilter = "all" | "active" | "inactive"

export type CreateUserFormInput = z.input<typeof createUserFormSchema>
export type UpdateUserFormInput = z.input<typeof updateUserFormSchema>
export type ChangePasswordInput = z.input<typeof changePasswordSchema>

export type CreateUserInput = z.output<typeof createUserFormSchema>
export type UpdateUserInput = z.output<typeof updateUserFormSchema>
export type ChangePasswordPayload = z.output<typeof changePasswordSchema>

export type UserFieldName = keyof CreateUserFormInput | keyof UpdateUserFormInput
export type UserFieldErrors = Partial<Record<UserFieldName, string[]>>

export type UserListItem = {
  id: string
  name: string
  email: string
  role: UserRoleName
  isActive: boolean
  createdAt: Date
}

export type UserDetails = {
  id: string
  name: string
  email: string
  role: UserRoleName
  isActive: boolean
  createdAt: Date
}

export type ListUsersParams = {
  search?: string
  active?: UserActiveFilter
  page?: number
  pageSize?: number
}

export type ListUsersResult = {
  data: UserListItem[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type UserMutationResult =
  | {
      ok: true
      id: string
    }
  | {
      ok: false
      fieldErrors?: UserFieldErrors
      formError?: string
    }

export type UserDeleteResult =
  | {
      ok: true
    }
  | {
      ok: false
      formError: string
    }
