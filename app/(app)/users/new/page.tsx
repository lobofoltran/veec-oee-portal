import { redirect } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { UserForm } from "../_components/UserForm"
import { canManageUsers, requireUsersSession } from "../_lib/auth"

export default async function NewUserPage() {
  const session = await requireUsersSession()

  if (!canManageUsers(session.user.roles)) {
    redirect("/users")
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">New User</h1>
        <p className="text-muted-foreground text-sm">
          Create a user and define initial password and role.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User information</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm mode="create" />
        </CardContent>
      </Card>
    </div>
  )
}
