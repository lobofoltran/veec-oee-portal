"use client"

import { Fragment, useMemo } from "react"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

function formatSegment(segment: string) {
  if (segment === "dashboard") return "Dashboard"
  if (segment === "factories") return "Fábricas"
  if (segment === "users") return "Usuários"
  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ")
}

function getBreadcrumbItems(pathname: string) {
  const segments = pathname.split("/").filter(Boolean)

  if (segments[0] === "factories") {
    return ["Cadastros", "Fábricas"]
  }

  if (segments[0] === "users") {
    return ["Cadastros", "Usuários"]
  }

  if (segments.length === 0) {
    return ["Dashboard"]
  }

  const mapped = segments.map(formatSegment)

  if (mapped.length === 1) {
    return [mapped[0], mapped[0]]
  }

  return mapped.slice(0, 2)
}

export function SiteHeader() {
  const pathname = usePathname()
  const breadcrumbItems = useMemo(() => getBreadcrumbItems(pathname), [pathname])

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbItems.map((item, index) => (
              <Fragment key={`${item}-${index}`}>
                {index > 0 && <BreadcrumbSeparator>{">"}</BreadcrumbSeparator>}
                <BreadcrumbItem>
                  <BreadcrumbPage className="text-sm font-medium">{item}</BreadcrumbPage>
                </BreadcrumbItem>
              </Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  )
}
