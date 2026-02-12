import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { ChangePasswordForm } from "../../_components/ChangePasswordForm"
import { canManageUsers, requireUsersSession } from "../../_lib/auth"
import { getUserByIdService } from "../../_lib/service"

type ChangePasswordPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function ChangePasswordPage({
  params,
}: ChangePasswordPageProps) {
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
          <h1 className="text-2xl font-semibold">Change Password</h1>
          <p className="text-muted-foreground text-sm">
            Define a new password for {user.name}.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Password update</CardTitle>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm userId={user.id} cancelHref={`/users/${id}`} />
        </CardContent>
      </Card>
    </div>
  )
}
