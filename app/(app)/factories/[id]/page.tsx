import Link from "next/link"
import { notFound } from "next/navigation"

import { Button } from "@/components/ui/button"

import { FactoryDetails } from "../_components/FactoryDetails"
import { canManageFactories, requireFactoriesSession } from "../_lib/auth"
import { getFactoryByIdService } from "../_lib/service"

type FactoryDetailsPageProps = {
  params: Promise<{
    id: string
  }>
}

export default async function FactoryDetailsPage({
  params,
}: FactoryDetailsPageProps) {
  const { id } = await params
  const session = await requireFactoriesSession()
  const canManage = canManageFactories(session.user.roles)

  const factory = await getFactoryByIdService(id)

  if (!factory) {
    notFound()
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/factories">Back to list</Link>
        </Button>
      </div>

      <FactoryDetails factory={factory} canManage={canManage} />
    </div>
  )
}
