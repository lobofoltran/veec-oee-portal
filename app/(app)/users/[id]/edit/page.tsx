import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { UserForm } from "../../_components/UserForm"
import { canManageUsers, requireUsersSession } from "../../_lib/auth"
import { getUserByIdService } from "../../_lib/service"

type EditUserPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params
  const session = await requireUsersSession()

  if (!canManageUsers(session.user.roles)) {
    redirect(`/users/${id}`)
  }

  const user = await getUserByIdService(id)

  if (!user) {
    notFound()
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3">
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link href={`/users/${id}`}>Back to details</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Edit User</h1>
          <p className="text-muted-foreground text-sm">
            Update user profile, role, and status.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User information</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm mode="edit" initialUser={user} />
        </CardContent>
      </Card>
    </div>
  )
}
