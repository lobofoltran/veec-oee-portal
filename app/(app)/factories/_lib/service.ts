import {
  createFactory as createFactoryInRepository,
  deleteFactory as deleteFactoryInRepository,
  getFactoryById,
  listFactories,
  updateFactory as updateFactoryInRepository,
} from "./repository"
import type {
  CreateFactoryInput,
  Factory,
  ListFactoriesParams,
  ListFactoriesResult,
  UpdateFactoryInput,
} from "./types"

type CreateFactoryServiceResult =
  | {
      ok: true
      data: Factory
    }
  | {
      ok: false
      reason: "CODE_ALREADY_EXISTS"
    }

type UpdateFactoryServiceResult =
  | {
      ok: true
      data: Factory
    }
  | {
      ok: false
      reason: "NOT_FOUND" | "CODE_ALREADY_EXISTS"
    }

type DeleteFactoryServiceResult =
  | {
      ok: true
    }
  | {
      ok: false
      reason: "NOT_FOUND" | "HAS_DEPENDENCIES"
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

export async function listFactoriesService(
  params: ListFactoriesParams
): Promise<ListFactoriesResult> {
  return listFactories(params)
}

export async function getFactoryByIdService(id: string) {
  return getFactoryById(id)
}

export async function createFactoryService(
  input: CreateFactoryInput
): Promise<CreateFactoryServiceResult> {
  try {
    const createdFactory = await createFactoryInRepository(input)

    return {
      ok: true,
      data: createdFactory,
    }
  } catch (error) {
    if (getPrismaErrorCode(error) === "P2002") {
      return {
        ok: false,
        reason: "CODE_ALREADY_EXISTS",
      }
    }

    throw error
  }
}

export async function updateFactoryService(
  id: string,
  input: UpdateFactoryInput
): Promise<UpdateFactoryServiceResult> {
  try {
    const updatedFactory = await updateFactoryInRepository(id, input)

    return {
      ok: true,
      data: updatedFactory,
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
        reason: "CODE_ALREADY_EXISTS",
      }
    }

    throw error
  }
}

export async function deleteFactoryService(
  id: string
): Promise<DeleteFactoryServiceResult> {
  try {
    await deleteFactoryInRepository(id)

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
