"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, Database, Eye, MoreVertical, Pencil, Settings2, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import { deleteDictionaryAction } from "../actions/delete-dictionary";

type Row = {
  id: string;
  name: string;
  label: string;
  description: string | null;
  schema: string;
  createdAt: Date;
  columnsCount: number;
  active: boolean;
};

export function DictionariesTable({ rows, page, pageSize, total, totalPages, q, sortBy, sortDir }: { rows: Row[]; page: number; pageSize: number; total: number; totalPages: number; q: string; sortBy: "name" | "createdAt" | "columns" | "active"; sortDir: "asc" | "desc" }) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(q);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

  useEffect(() => {
    setSearch(q);
  }, [q]);

  function buildQueryString(next: {
    q?: string;
    page?: number;
    sortBy?: "name" | "createdAt" | "columns" | "active";
    sortDir?: "asc" | "desc";
  }) {
    const params = new URLSearchParams();
    const nextQ = next.q ?? q;
    const nextPage = next.page ?? page;
    const nextSortBy = next.sortBy ?? sortBy;
    const nextSortDir = next.sortDir ?? sortDir;

    if (nextQ) {
      params.set("q", nextQ);
    }
    params.set("page", String(nextPage));
    params.set("pageSize", String(pageSize));
    params.set("sortBy", nextSortBy);
    params.set("sortDir", nextSortDir);

    return params.toString();
  }

  function toggleSort(column: "name" | "createdAt" | "columns" | "active") {
    const nextDir = sortBy === column && sortDir === "asc" ? "desc" : "asc";
    const query = buildQueryString({ sortBy: column, sortDir: nextDir, page: 1 });
    router.push(`${pathname}?${query}`);
  }

  function navigateToPage(nextPage: number) {
    const query = buildQueryString({ page: nextPage });
    router.push(`${pathname}?${query}`);
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = buildQueryString({
      q: search.trim(),
      page: 1,
    });
    router.push(`${pathname}?${query}`);
  }

  const range = useMemo(() => {
    if (total === 0) return "0 resultados";
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    return `${start}-${end} de ${total}`;
  }, [page, pageSize, total]);

  async function confirmDelete() {
    if (!targetDeleteId) return;
    await deleteDictionaryAction(targetDeleteId);
    setTargetDeleteId(null);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit}>
        <Input placeholder="Buscar dicionários" value={search} onChange={(event) => setSearch(event.target.value)} className="md:max-w-sm" />
      </form>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader className="sticky top-0 bg-background z-10">
            <TableRow>
              <TableHead><button type="button" onClick={() => toggleSort("name")} className="hover:underline">Nome</button></TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Schema</TableHead>
              <TableHead><button type="button" onClick={() => toggleSort("columns")} className="hover:underline">Qtd. colunas</button></TableHead>
              <TableHead><button type="button" onClick={() => toggleSort("createdAt")} className="hover:underline">Criado em</button></TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-muted/40">
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-2"><Database className="size-4 text-primary" />{row.label}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{row.description || "-"}</TableCell>
                  <TableCell>{row.schema}</TableCell>
                  <TableCell><Badge variant="secondary">{row.columnsCount}</Badge></TableCell>
                  <TableCell>{new Date(row.createdAt).toLocaleString()}</TableCell>
                  <TableCell><Badge variant={row.active ? "default" : "outline"}>{row.active ? "Ativo" : "Inativo"}</Badge></TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-8"><MoreVertical className="size-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/dictionaries/${row.id}`}>
                            <Eye className="mr-2 size-4" />
                            Visualizar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/crud/${row.schema}/${row.name}`}>
                            <ArrowRight className="mr-2 size-4" />
                            Ir para página
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild><Link href={`/admin/dictionaries/${row.id}/edit`}><Pencil className="mr-2 size-4" />Editar</Link></DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/dictionaries/${row.id}/columns`}>
                            <Settings2 className="mr-2 size-4" />
                            Gerenciar colunas
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onSelect={(event) => { event.preventDefault(); setTargetDeleteId(row.id); }}><Trash2 className="mr-2 size-4" />Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan={7} className="py-10 text-center">Nenhum dicionário encontrado.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">{range}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => navigateToPage(page - 1)}>Anterior</Button>
          <span className="text-sm">Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => navigateToPage(page + 1)}>Próxima</Button>
        </div>
      </div>

      <AlertDialog open={Boolean(targetDeleteId)} onOpenChange={(open) => !open && setTargetDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir dicionário</AlertDialogTitle>
            <AlertDialogDescription>Isso removerá metadados e rascunhos de colunas.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
