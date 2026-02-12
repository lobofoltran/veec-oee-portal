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
import type { Factory } from "../_lib/types"
import { DeleteFactoryDialog } from "./DeleteFactoryDialog"

type FactoryDetailsProps = {
  factory: Factory
  canManage: boolean
}

function displayValue(value?: string | null) {
  return value?.trim() ? value : "-"
}

export function FactoryDetails({ factory, canManage }: FactoryDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{factory.name}</h1>
            <Badge variant="outline">{factory.code}</Badge>
            <Badge variant={factory.isActive ? "default" : "outline"}>
              {factory.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            Last updated {formatDateTime(factory.updatedAt)}
          </p>
        </div>

        {canManage ? (
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href={`/factories/${factory.id}/edit`}>Edit</Link>
            </Button>
            <DeleteFactoryDialog
              factoryId={factory.id}
              factoryName={factory.name}
              redirectTo="/factories"
              trigger={<Button variant="destructive">Delete</Button>}
            />
          </div>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Factory details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-xs">Code</p>
            <p className="text-sm font-medium">{factory.code}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Name</p>
            <p className="text-sm font-medium">{factory.name}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Legal name</p>
            <p className="text-sm">{displayValue(factory.legalName)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Document</p>
            <p className="text-sm">{displayValue(factory.document)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Email</p>
            <p className="text-sm">{displayValue(factory.email)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Phone</p>
            <p className="text-sm">{displayValue(factory.phone)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Address line 1</p>
            <p className="text-sm">{displayValue(factory.addressLine1)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Address line 2</p>
            <p className="text-sm">{displayValue(factory.addressLine2)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">City</p>
            <p className="text-sm">{displayValue(factory.city)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">State</p>
            <p className="text-sm">{displayValue(factory.state)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">ZIP</p>
            <p className="text-sm">{displayValue(factory.zip)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Created at</p>
            <p className="text-sm">{formatDateTime(factory.createdAt)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
