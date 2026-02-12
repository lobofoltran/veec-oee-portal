import { redirect } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { FactoryForm } from "../_components/FactoryForm"
import { canManageFactories, requireFactoriesSession } from "../_lib/auth"

export default async function NewFactoryPage() {
  const session = await requireFactoriesSession()

  if (!canManageFactories(session.user.roles)) {
    redirect("/factories")
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold">New Factory</h1>
        <p className="text-muted-foreground text-sm">
          Create a new factory record.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Factory information</CardTitle>
        </CardHeader>
        <CardContent>
          <FactoryForm mode="create" />
        </CardContent>
      </Card>
    </div>
  )
}
