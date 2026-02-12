import { hash } from "bcrypt"

import {
  createUser as createUserInRepository,
  deleteUser as deleteUserInRepository,
  getUserById,
  listUsers,
  updateUser as updateUserInRepository,
  updateUserPassword as updateUserPasswordInRepository,
} from "./repository"
import type {
  ChangePasswordPayload,
  CreateUserInput,
  ListUsersParams,
  ListUsersResult,
  UpdateUserInput,
  UserDetails,
} from "./types"

type ServiceErrorReason =
  | "EMAIL_ALREADY_EXISTS"
  | "NOT_FOUND"
  | "HAS_DEPENDENCIES"
  | "INVALID_OPERATION"

type MutationServiceResult =
  | {
      ok: true
      data: UserDetails
    }
  | {
      ok: false
      reason: ServiceErrorReason
    }

type ChangePasswordServiceResult =
  | {
      ok: true
    }
  | {
      ok: false
      reason: ServiceErrorReason
    }

type DeleteUserServiceResult =
  | {
      ok: true
    }
  | {
      ok: false
      reason: ServiceErrorReason
    }

function getPrismaErrorCode(error: unknown): string | null {
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code?: unknown }).code

    if (typeof code === "string") {
      return code
    }
  }

  return null
}

export async function listUsersService(
  params: ListUsersParams
): Promise<ListUsersResult> {
  return listUsers(params)
}

export async function getUserByIdService(id: string) {
  return getUserById(id)
}

export async function createUserService(
  input: CreateUserInput
): Promise<MutationServiceResult> {
  try {
    const passwordHash = await hash(input.password, 10)
    const createdUser = await createUserInRepository({
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      isActive: input.isActive,
      passwordHash,
    })

    return {
      ok: true,
      data: createdUser,
    }
  } catch (error) {
    if (getPrismaErrorCode(error) === "P2002") {
      return {
        ok: false,
        reason: "EMAIL_ALREADY_EXISTS",
      }
    }

    throw error
  }
}

export async function updateUserService(
  id: string,
  input: UpdateUserInput
): Promise<MutationServiceResult> {
  try {
    const updatedUser = await updateUserInRepository(id, {
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      role: input.role,
      isActive: input.isActive,
    })

    return {
      ok: true,
      data: updatedUser,
    }
  } catch (error) {
    const code = getPrismaErrorCode(error)

    if (code === "P2025") {
      return {
        ok: false,
        reason: "NOT_FOUND",
      }
    }

    if (code === "P2002") {
      return {
        ok: false,
        reason: "EMAIL_ALREADY_EXISTS",
      }
    }

    throw error
  }
}

export async function changeUserPasswordService(
  id: string,
  input: ChangePasswordPayload
): Promise<ChangePasswordServiceResult> {
  try {
    const passwordHash = await hash(input.password, 10)

    await updateUserPasswordInRepository(id, {
      passwordHash,
    })

    return { ok: true }
  } catch (error) {
    if (getPrismaErrorCode(error) === "P2025") {
      return {
        ok: false,
        reason: "NOT_FOUND",
      }
    }

    throw error
  }
}

export async function deleteUserService(id: string): Promise<DeleteUserServiceResult> {
  try {
    await deleteUserInRepository(id)

    return {
      ok: true,
    }
  } catch (error) {
    const code = getPrismaErrorCode(error)

    if (code === "P2025") {
      return {
        ok: false,
        reason: "NOT_FOUND",
      }
    }

    if (code === "P2003") {
      return {
        ok: false,
        reason: "HAS_DEPENDENCIES",
      }
    }

    throw error
  }
}
