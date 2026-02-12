import type { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"

import type {
  ListUsersParams,
  ListUsersResult,
  UpdateUserInput,
  UserActiveFilter,
  UserDetails,
  UserListItem,
  UserRoleName,
} from "./types"

type CreateUserRepositoryInput = {
  name: string
  email: string
  passwordHash: string
  role: UserRoleName
  isActive: boolean
}

type ChangePasswordRepositoryInput = {
  passwordHash: string
}

function buildUserFilter(search?: string, active?: UserActiveFilter) {
  const where: Prisma.UserWhereInput = {}

  if (active === "active") {
    where.active = true
  } else if (active === "inactive") {
    where.active = false
  }

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
    ]
  }

  return where
}

function mapUserRole(roleName?: string | null): UserRoleName {
  if (roleName === "ADMIN" || roleName === "MANAGER" || roleName === "OPERATOR") {
    return roleName
  }

  return "OPERATOR"
}

function toUserListItem(user: {
  id: string
  name: string
  email: string
  active: boolean
  createdAt: Date
  roles: Array<{
    role: {
      name: string
    }
  }>
}): UserListItem {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: mapUserRole(user.roles[0]?.role.name),
    isActive: user.active,
    createdAt: user.createdAt,
  }
}

function toUserDetails(user: {
  id: string
  name: string
  email: string
  active: boolean
  createdAt: Date
  roles: Array<{
    role: {
      name: string
    }
  }>
}): UserDetails {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: mapUserRole(user.roles[0]?.role.name),
    isActive: user.active,
    createdAt: user.createdAt,
  }
}

async function upsertRoleByName(tx: Prisma.TransactionClient, roleName: UserRoleName) {
  return tx.role.upsert({
    where: {
      name: roleName,
    },
    update: {},
    create: {
      name: roleName,
    },
  })
}

export async function listUsers(params: ListUsersParams = {}): Promise<ListUsersResult> {
  const pageSize = Math.min(Math.max(params.pageSize ?? 10, 1), 100)
  const requestedPage = Math.max(params.page ?? 1, 1)

  const where = buildUserFilter(params.search, params.active)
  const total = await prisma.user.count({ where })
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize)
  const page = Math.min(requestedPage, totalPages)
  const skip = (page - 1) * pageSize

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
      createdAt: true,
      roles: {
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    skip,
    take: pageSize,
  })

  return {
    data: users.map(toUserListItem),
    total,
    page,
    pageSize,
    totalPages,
  }
}

export async function getUserById(id: string): Promise<UserDetails | null> {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      active: true,
      createdAt: true,
      roles: {
        select: {
          role: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  })

  return user ? toUserDetails(user) : null
}

export async function createUser(data: CreateUserRepositoryInput): Promise<UserDetails> {
  const user = await prisma.$transaction(async (tx) => {
    const role = await upsertRoleByName(tx, data.role)

    const createdUser = await tx.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: data.passwordHash,
        active: data.isActive,
      },
      select: {
        id: true,
      },
    })

    await tx.userRole.create({
      data: {
        userId: createdUser.id,
        roleId: role.id,
      },
    })

    const userWithRole = await tx.user.findUniqueOrThrow({
      where: { id: createdUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        createdAt: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    return toUserDetails(userWithRole)
  })

  return user
}

export async function updateUser(id: string, data: UpdateUserInput): Promise<UserDetails> {
  const updatedUser = await prisma.$transaction(async (tx) => {
    const role = await upsertRoleByName(tx, data.role)

    await tx.user.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        active: data.isActive,
      },
    })

    await tx.userRole.deleteMany({
      where: { userId: id },
    })

    await tx.userRole.create({
      data: {
        userId: id,
        roleId: role.id,
      },
    })

    const userWithRole = await tx.user.findUniqueOrThrow({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        active: true,
        createdAt: true,
        roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    return toUserDetails(userWithRole)
  })

  return updatedUser
}

export async function updateUserPassword(
  id: string,
  data: ChangePasswordRepositoryInput
): Promise<void> {
  await prisma.user.update({
    where: { id },
    data: {
      password: data.passwordHash,
    },
  })
}

export async function deleteUser(id: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    await tx.userRole.deleteMany({
      where: { userId: id },
    })

    await tx.user.delete({
      where: { id },
    })
  })
}
