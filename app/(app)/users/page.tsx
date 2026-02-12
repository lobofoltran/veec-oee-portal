import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { UsersFilters } from "./_components/UsersFilters"
import { UsersTable } from "./_components/UsersTable"
import { canManageUsers, requireUsersSession } from "./_lib/auth"
import { parseListUsersQuery } from "./_lib/schema"
import { listUsersService } from "./_lib/service"

type UsersPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const session = await requireUsersSession()
  const canManage = canManageUsers(session.user.roles)

  const resolvedSearchParams = (await searchParams) ?? {}
  const query = parseListUsersQuery(resolvedSearchParams)
  const users = await listUsersService({
    search: query.q,
    active: query.active,
    page: query.page,
    pageSize: query.pageSize,
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Usuários</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie usuários, papéis de acesso e ciclo de vida da senha.
          </p>
        </div>

        {canManage ? (
          <Button asChild>
            <Link href="/users/new">Novo Usuário</Link>
          </Button>
        ) : null}
      </div>

      <UsersFilters
        initialSearch={query.q}
        initialActive={query.active}
        initialPageSize={query.pageSize}
      />

      {users.total === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum usuário ainda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Crie seu primeiro usuário para conceder acesso à plataforma.
            </p>
            {canManage ? (
              <Button asChild>
                <Link href="/users/new">Criar primeiro usuário</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <UsersTable
          users={users.data}
          search={query.q}
          active={query.active}
          page={users.page}
          pageSize={users.pageSize}
          total={users.total}
          totalPages={users.totalPages}
          canManage={canManage}
        />
      )}
    </div>
  )
}
