"use client"

import { useMemo, useState, useTransition, type FormEvent } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { FactoryActiveFilter } from "../_lib/types"

type FactoryFiltersProps = {
  initialSearch: string
  initialActive: FactoryActiveFilter
  initialPageSize: number
}

export function FactoryFilters({
  initialSearch,
  initialActive,
  initialPageSize,
}: FactoryFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(initialSearch)
  const [active, setActive] = useState<FactoryActiveFilter>(initialActive)

  const currentPageSize = useMemo(() => {
    const pageSizeParam = searchParams.get("pageSize")
    const pageSize = Number(pageSizeParam)

    if (!Number.isFinite(pageSize) || pageSize < 1) {
      return initialPageSize
    }

    return pageSize
  }, [searchParams, initialPageSize])

  function handleApply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const params = new URLSearchParams(searchParams.toString())
    const trimmedSearch = search.trim()

    if (trimmedSearch) {
      params.set("q", trimmedSearch)
    } else {
      params.delete("q")
    }

    if (active === "all") {
      params.delete("active")
    } else {
      params.set("active", active)
    }

    params.set("page", "1")
    params.set("pageSize", String(currentPageSize))

    startTransition(() => {
      const queryString = params.toString()
      router.push(queryString ? `${pathname}?${queryString}` : pathname)
    })
  }

  function handleReset() {
    setSearch("")
    setActive("all")

    startTransition(() => {
      router.push(pathname)
    })
  }

  return (
    <form
      onSubmit={handleApply}
      className="flex flex-col gap-3 md:flex-row md:items-center"
    >
      <Input
        placeholder="Pesquisar por código ou nome"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="md:max-w-sm"
      />

      <Select
        value={active}
        onValueChange={(value) => setActive(value as FactoryActiveFilter)}
      >
        <SelectTrigger className="w-full md:w-44">
          <SelectValue placeholder="Filtrar status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as fábricas</SelectItem>
          <SelectItem value="active">Somente ativas</SelectItem>
          <SelectItem value="inactive">Somente inativas</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Aplicando..." : "Aplicar"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isPending}
        >
          Limpar
        </Button>
      </div>
    </form>
  )
}
