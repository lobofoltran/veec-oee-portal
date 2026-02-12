import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { hasRole } from "@/lib/rbac"

const FACTORY_MANAGER_ROLES = ["ADMIN", "MANAGER"]

export async function requireFactoriesSession() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  return session
}

export function canManageFactories(roles: string[] = []) {
  return hasRole(roles, FACTORY_MANAGER_ROLES)
}

export async function requireFactoriesManager() {
  const session = await requireFactoriesSession()

  if (!canManageFactories(session.user.roles)) {
    throw new Error("FORBIDDEN")
  }

  return session
}
