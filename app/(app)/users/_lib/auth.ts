import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"

import { authOptions } from "@/lib/auth"
import { hasRole } from "@/lib/rbac"

const USER_MANAGER_ROLES = ["ADMIN", "MANAGER"]

export async function requireUsersSession() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  return session
}

export function canManageUsers(roles: string[] = []) {
  return hasRole(roles, USER_MANAGER_ROLES)
}

export async function requireUsersManager() {
  const session = await requireUsersSession()

  if (!canManageUsers(session.user.roles)) {
    throw new Error("FORBIDDEN")
  }

  return session
}
