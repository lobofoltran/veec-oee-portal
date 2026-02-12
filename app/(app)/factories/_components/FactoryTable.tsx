"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { MoreVerticalCircle01Icon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { formatCityState, formatDateTime } from "../_lib/format"
import type { FactoryActiveFilter, FactoryListItem } from "../_lib/types"
import { DeleteFactoryDialog } from "./DeleteFactoryDialog"

type FactoryTableProps = {
  factories: FactoryListItem[]
  search: string
  active: FactoryActiveFilter
  page: number
  pageSize: number
  total: number
  totalPages: number
  canManage: boolean
}

type FactoryRowActionsProps = {
  factory: FactoryListItem
  canManage: boolean
}

function FactoryRowActions({ factory, canManage }: FactoryRowActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <HugeiconsIcon icon={MoreVerticalCircle01Icon} strokeWidth={2} />
            <span className="sr-only">Abrir ações</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-32">
          <DropdownMenuItem asChild>
            <Link href={`/factories/${factory.id}`}>Visualizar</Link>
          </DropdownMenuItem>
          {canManage ? (
            <DropdownMenuItem asChild>
              <Link href={`/factories/${factory.id}/edit`}>Editar</Link>
            </DropdownMenuItem>
          ) : null}
          {canManage ? (
            <DropdownMenuItem
              variant="destructive"
              onSelect={(event) => {
                event.preventDefault()
                setDeleteOpen(true)
              }}
            >
              Excluir
            </DropdownMenuItem>
          ) : null}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteFactoryDialog
        factoryId={factory.id}
        factoryName={factory.name}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </>
  )
}

export function FactoryTable({
  factories,
  search,
  active,
  page,
  pageSize,
  total,
  totalPages,
  canManage,
}: FactoryTableProps) {
  const router = useRouter()
  const pathname = usePathname()

  const range = useMemo(() => {
    if (total === 0) {
      return "0 resultados"
    }

    const start = (page - 1) * pageSize + 1
    const end = Math.min(page * pageSize, total)

    return `${start}-${end} de ${total}`
  }, [page, pageSize, total])

  function navigateToPage(nextPage: number) {
    const params = new URLSearchParams()

    if (search) {
      params.set("q", search)
    }

    if (active !== "all") {
      params.set("active", active)
    }

    params.set("page", String(nextPage))
    params.set("pageSize", String(pageSize))

    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Cidade / Estado</TableHead>
              <TableHead>Ativa</TableHead>
              <TableHead>Atualizada em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {factories.length > 0 ? (
              factories.map((factory) => (
                <TableRow key={factory.id}>
                  <TableCell className="font-medium">{factory.code}</TableCell>
                  <TableCell>{factory.name}</TableCell>
                  <TableCell>
                    {formatCityState(factory.city, factory.state)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={factory.isActive ? "default" : "outline"}>
                      {factory.isActive ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDateTime(new Date(factory.updatedAt))}</TableCell>
                  <TableCell className="text-right">
                    <FactoryRowActions factory={factory} canManage={canManage} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center">
                  Nenhuma fábrica encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">{range}</p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToPage(page - 1)}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <span className="text-sm">
            Página {page} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateToPage(page + 1)}
            disabled={page >= totalPages}
          >
            Próxima
          </Button>
        </div>
      </div>
    </div>
  )
}
