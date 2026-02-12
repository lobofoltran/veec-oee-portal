import Link from "next/link"
import { notFound, redirect } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { FactoryForm } from "../../_components/FactoryForm"
import { canManageFactories, requireFactoriesSession } from "../../_lib/auth"
import { getFactoryByIdService } from "../../_lib/service"

type EditFactoryPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function EditFactoryPage({ params }: EditFactoryPageProps) {
  const { id } = await params
  const session = await requireFactoriesSession()

  if (!canManageFactories(session.user.roles)) {
    redirect(`/factories/${id}`)
  }

  const factory = await getFactoryByIdService(id)

  if (!factory) {
    notFound()
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3">
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link href={`/factories/${id}`}>Back to details</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Edit Factory</h1>
          <p className="text-muted-foreground text-sm">
            Update factory information and status.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Factory information</CardTitle>
        </CardHeader>
        <CardContent>
          <FactoryForm mode="edit" initialFactory={factory} />
        </CardContent>
      </Card>
    </div>
  )
}
