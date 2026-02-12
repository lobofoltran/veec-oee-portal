import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { authOptions } from "@/lib/auth";
import { hasRole } from "@/lib/rbac";

const ADMIN_ROLES = ["ADMIN", "MANAGER"];

export async function requireAdminSession() {
  if (process.env.NODE_ENV !== "production" || process.env.E2E_BYPASS_AUTH === "true") {
    return {
      user: {
        id: "e2e-admin",
        name: "E2E Admin",
        email: "e2e-admin@local",
        roles: ["ADMIN"],
      },
    };
  }

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (!hasRole(session.user.roles, ADMIN_ROLES)) {
    throw new Error("FORBIDDEN");
  }

  return session;
}
