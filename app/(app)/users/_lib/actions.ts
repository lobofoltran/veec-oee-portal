"use server"

import { revalidatePath } from "next/cache"

import {
  changePasswordSchema,
  createUserFormSchema,
  updateUserFormSchema,
} from "./schema"
import {
  changeUserPasswordService,
  createUserService,
  deleteUserService,
  updateUserService,
} from "./service"
import { requireUsersManager } from "./auth"
import type {
  ChangePasswordInput,
  UserDeleteResult,
  UserFieldErrors,
  UserMutationResult,
  CreateUserFormInput,
  UpdateUserFormInput,
} from "./types"

function isForbiddenError(error: unknown) {
  return error instanceof Error && error.message === "FORBIDDEN"
}

export async function createUserAction(
  input: CreateUserFormInput
): Promise<UserMutationResult> {
  try {
    await requireUsersManager()

    const parsed = createUserFormSchema.safeParse(input)

    if (!parsed.success) {
      return {
        ok: false,
        fieldErrors: parsed.error.flatten().fieldErrors as UserFieldErrors,
      }
    }

    const result = await createUserService(parsed.data)

    if (!result.ok) {
      return {
        ok: false,
        fieldErrors: {
          email: ["Email is already in use."],
        },
      }
    }

    revalidatePath("/users")
    revalidatePath(`/users/${result.data.id}`)

    return {
      ok: true,
      id: result.data.id,
    }
  } catch (error) {
    if (isForbiddenError(error)) {
      return {
        ok: false,
        formError: "You do not have permission to create users.",
      }
    }

    throw error
  }
}

export async function updateUserAction(
  id: string,
  input: UpdateUserFormInput
): Promise<UserMutationResult> {
  try {
    await requireUsersManager()

    const parsed = updateUserFormSchema.safeParse(input)

    if (!parsed.success) {
      return {
        ok: false,
        fieldErrors: parsed.error.flatten().fieldErrors as UserFieldErrors,
      }
    }

    const result = await updateUserService(id, parsed.data)

    if (!result.ok) {
      if (result.reason === "NOT_FOUND") {
        return {
          ok: false,
          formError: "User not found.",
        }
      }

      return {
        ok: false,
        fieldErrors: {
          email: ["Email is already in use."],
        },
      }
    }

    revalidatePath("/users")
    revalidatePath(`/users/${id}`)

    return {
      ok: true,
      id: result.data.id,
    }
  } catch (error) {
    if (isForbiddenError(error)) {
      return {
        ok: false,
        formError: "You do not have permission to edit users.",
      }
    }

    throw error
  }
}

export async function changeUserPasswordAction(
  id: string,
  input: ChangePasswordInput
): Promise<UserMutationResult> {
  try {
    await requireUsersManager()

    const parsed = changePasswordSchema.safeParse(input)

    if (!parsed.success) {
      return {
        ok: false,
        fieldErrors: parsed.error.flatten().fieldErrors as UserFieldErrors,
      }
    }

    const result = await changeUserPasswordService(id, parsed.data)

    if (!result.ok) {
      return {
        ok: false,
        formError: "User not found.",
      }
    }

    revalidatePath("/users")
    revalidatePath(`/users/${id}`)

    return {
      ok: true,
      id,
    }
  } catch (error) {
    if (isForbiddenError(error)) {
      return {
        ok: false,
        formError: "You do not have permission to change passwords.",
      }
    }

    throw error
  }
}

export async function deleteUserAction(id: string): Promise<UserDeleteResult> {
  try {
    const session = await requireUsersManager()

    if (session.user.id === id) {
      return {
        ok: false,
        formError: "Você não pode excluir seu próprio usuário.",
      }
    }

    const result = await deleteUserService(id)

    if (!result.ok) {
      if (result.reason === "NOT_FOUND") {
        return {
          ok: false,
          formError: "Usuário não encontrado.",
        }
      }

      return {
        ok: false,
        formError:
          "Este usuário não pode ser removido porque está vinculado a outros registros.",
      }
    }

    revalidatePath("/users")
    revalidatePath(`/users/${id}`)

    return {
      ok: true,
    }
  } catch (error) {
    if (isForbiddenError(error)) {
      return {
        ok: false,
        formError: "Você não tem permissão para excluir usuários.",
      }
    }

    throw error
  }
}
