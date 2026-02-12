import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"

import { UserDetails } from "../_components/UserDetails"
import { canManageUsers, requireUsersSession } from "../_lib/auth"
import { getUserByIdService } from "../_lib/service"

type UserDetailsPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function UserDetailsPage({ params }: UserDetailsPageProps) {
  const { id } = await params
  const session = await requireUsersSession()
  const canManage = canManageUsers(session.user.roles)

  const user = await getUserByIdService(id)

  if (!user) {
    notFound()
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/users">Back to list</Link>
        </Button>
      </div>
      <UserDetails user={user} canManage={canManage} />
    </div>
  )
}
