"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoreVerticalCircle01Icon } from "@hugeicons/core-free-icons";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TableMeta } from "@/lib/dictionary/types";

type Props = {
  schema: string;
  table: string;
  rows: Record<string, unknown>[];
  tableMeta: TableMeta;
  displayMaps: Record<string, Record<string, string>>;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  returnTo?: string;
};

export function CrudTable({
  schema,
  table,
  rows,
  tableMeta,
  displayMaps,
  page,
  pageSize,
  total,
  totalPages,
  returnTo,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const orderedColumns = [
    { name: "id", label: "ID" },
    ...tableMeta.columns.map((column) => ({ name: column.name, label: column.label })),
  ];

  const range = useMemo(() => {
    if (total === 0) return "0 resultados";
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    return `${start}-${end} de ${total}`;
  }, [page, pageSize, total]);

  function navigateToPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    params.set("pageSize", String(pageSize));
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {orderedColumns.map((column) => (
                <TableHead key={column.name}>{column.label}</TableHead>
              ))}
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => {
                const rowId = String(row.id ?? "");
                const href = returnTo
                  ? `/crud/${schema}/${table}/${rowId}?returnTo=${encodeURIComponent(returnTo)}`
                  : `/crud/${schema}/${table}/${rowId}`;

                return (
                  <TableRow key={rowId}>
                    {orderedColumns.map((column) => {
                      const raw = row[column.name];
                      const map = displayMaps[column.name];
                      const value =
                        raw == null
                          ? "-"
                          : map && typeof raw === "string" && map[raw]
                            ? map[raw]
                            : String(raw);

                      return (
                        <TableCell key={`${rowId}-${column.name}`} className={column.name === "id" ? "font-medium" : undefined}>
                          {value}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <HugeiconsIcon icon={MoreVerticalCircle01Icon} strokeWidth={2} />
                            <span className="sr-only">Abrir ações</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-32">
                          <DropdownMenuItem asChild>
                            <Link href={href}>Editar</Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild variant="destructive">
                            <Link href={href}>Excluir</Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={orderedColumns.length + 1} className="py-10 text-center">
                  Nenhum registro encontrado.
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
  );
}
