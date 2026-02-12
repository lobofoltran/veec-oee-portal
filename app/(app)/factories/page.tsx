import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { FactoryFilters } from "./_components/FactoryFilters"
import { FactoryTable } from "./_components/FactoryTable"
import { canManageFactories, requireFactoriesSession } from "./_lib/auth"
import { parseListFactoriesQuery } from "./_lib/schema"
import { listFactoriesService } from "./_lib/service"

type FactoriesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function FactoriesPage({ searchParams }: FactoriesPageProps) {
  const session = await requireFactoriesSession()
  const canManage = canManageFactories(session.user.roles)

  const resolvedSearchParams = (await searchParams) ?? {}
  const query = parseListFactoriesQuery(resolvedSearchParams)
  const factories = await listFactoriesService({
    search: query.q,
    active: query.active,
    page: query.page,
    pageSize: query.pageSize,
  })

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Fábricas</h1>
          <p className="text-muted-foreground text-sm">
            Gerencie cadastros de fábricas e metadados operacionais.
          </p>
        </div>

        {canManage ? (
          <Button asChild>
            <Link href="/factories/new">Nova Fábrica</Link>
          </Button>
        ) : null}
      </div>

      <FactoryFilters
        initialSearch={query.q}
        initialActive={query.active}
        initialPageSize={query.pageSize}
      />

      {factories.total === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhuma fábrica ainda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Crie sua primeira fábrica para começar a organizar as unidades de produção.
            </p>
            {canManage ? (
              <Button asChild>
                <Link href="/factories/new">Criar primeira fábrica</Link>
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        <FactoryTable
          factories={factories.data}
          search={query.q}
          active={query.active}
          page={factories.page}
          pageSize={factories.pageSize}
          total={factories.total}
          totalPages={factories.totalPages}
          canManage={canManage}
        />
      )}
    </div>
  )
}
