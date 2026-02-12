import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import { formatDateTime } from "../_lib/format"
import type { UserDetails as UserDetailsType } from "../_lib/types"
import { DeleteUserDialog } from "./DeleteUserDialog"

type UserDetailsProps = {
  user: UserDetailsType
  canManage: boolean
}

export function UserDetails({ user, canManage }: UserDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{user.name}</h1>
            <Badge variant="outline">{user.role}</Badge>
            <Badge variant={user.isActive ? "default" : "outline"}>
              {user.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">{user.email}</p>
        </div>

        {canManage ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link href={`/users/${user.id}/edit`}>Edit</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/users/${user.id}/change-password`}>Change password</Link>
            </Button>
            <DeleteUserDialog
              userId={user.id}
              userName={user.name}
              redirectTo="/users"
              trigger={<Button variant="destructive">Delete</Button>}
            />
          </div>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-xs">Name</p>
            <p className="text-sm font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Email</p>
            <p className="text-sm">{user.email}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Role</p>
            <p className="text-sm">{user.role}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Status</p>
            <p className="text-sm">{user.isActive ? "Active" : "Inactive"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Created at</p>
            <p className="text-sm">{formatDateTime(user.createdAt)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
