"use server"

import { revalidatePath } from "next/cache"

import { createFactorySchema, updateFactorySchema } from "./schema"
import {
  createFactoryService,
  deleteFactoryService,
  updateFactoryService,
} from "./service"
import { requireFactoriesManager } from "./auth"
import type {
  FactoryDeleteResult,
  FactoryFieldErrors,
  FactoryFormInput,
  FactoryMutationResult,
} from "./types"

function isForbiddenError(error: unknown) {
  return error instanceof Error && error.message === "FORBIDDEN"
}

export async function createFactoryAction(
  input: FactoryFormInput
): Promise<FactoryMutationResult> {
  try {
    await requireFactoriesManager()

    const parsed = createFactorySchema.safeParse(input)

    if (!parsed.success) {
      return {
        ok: false,
        fieldErrors: parsed.error.flatten().fieldErrors as FactoryFieldErrors,
      }
    }

    const result = await createFactoryService(parsed.data)

    if (!result.ok) {
      return {
        ok: false,
        fieldErrors: {
          code: ["Code is already in use."],
        },
      }
    }

    revalidatePath("/factories")
    revalidatePath(`/factories/${result.data.id}`)

    return {
      ok: true,
      id: result.data.id,
    }
  } catch (error) {
    if (isForbiddenError(error)) {
      return {
        ok: false,
        formError: "You do not have permission to create factories.",
      }
    }

    throw error
  }
}

export async function updateFactoryAction(
  id: string,
  input: FactoryFormInput
): Promise<FactoryMutationResult> {
  try {
    await requireFactoriesManager()

    const parsed = updateFactorySchema.safeParse(input)

    if (!parsed.success) {
      return {
        ok: false,
        fieldErrors: parsed.error.flatten().fieldErrors as FactoryFieldErrors,
      }
    }

    const result = await updateFactoryService(id, parsed.data)

    if (!result.ok) {
      if (result.reason === "NOT_FOUND") {
        return {
          ok: false,
          formError: "Factory not found.",
        }
      }

      return {
        ok: false,
        fieldErrors: {
          code: ["Code is already in use."],
        },
      }
    }

    revalidatePath("/factories")
    revalidatePath(`/factories/${id}`)

    return {
      ok: true,
      id: result.data.id,
    }
  } catch (error) {
    if (isForbiddenError(error)) {
      return {
        ok: false,
        formError: "You do not have permission to edit factories.",
      }
    }

    throw error
  }
}

export async function deleteFactoryAction(id: string): Promise<FactoryDeleteResult> {
  try {
    await requireFactoriesManager()

    const result = await deleteFactoryService(id)

    if (!result.ok) {
      if (result.reason === "NOT_FOUND") {
        return {
          ok: false,
          formError: "Fábrica não encontrada.",
        }
      }

      return {
        ok: false,
        formError:
          "Esta fábrica não pode ser removida porque está vinculada a outros registros.",
      }
    }

    revalidatePath("/factories")
    revalidatePath(`/factories/${id}`)

    return {
      ok: true,
    }
  } catch (error) {
    if (isForbiddenError(error)) {
      return {
        ok: false,
        formError: "Você não tem permissão para excluir fábricas.",
      }
    }

    throw error
  }
}
