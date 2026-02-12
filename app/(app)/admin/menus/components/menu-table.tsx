"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Folder, FolderOpen, GripVertical, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import { deleteMenuAction } from "../actions/delete-menu";
import { reorderMenusAction } from "../actions/reorder-menus";
import type { MenuListItem } from "../actions/list-menus";

type MenuTableProps = {
  menus: MenuListItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  q: string;
  sortBy: "label" | "href" | "order" | "enabled";
  sortDir: "asc" | "desc";
};

function SortableMenuRow({
  menu,
  allowReorder,
  onDelete,
}: {
  menu: MenuListItem;
  allowReorder: boolean;
  onDelete: (menu: MenuListItem) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: menu.id,
    disabled: !allowReorder,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className="hover:bg-muted/40">
      <TableCell className="w-10">
        {allowReorder ? (
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground cursor-grab"
            {...attributes}
            {...listeners}
            aria-label="Arrastar menu"
          >
            <GripVertical className="size-4" />
          </button>
        ) : null}
      </TableCell>
      <TableCell className="font-medium">
        <span className="inline-flex items-center gap-2">
          {menu.isFolder ? <FolderOpen className="size-4 text-primary" /> : null}
          {menu.label}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground">{menu.href ?? "-"}</TableCell>
      <TableCell>
        {menu.folderName ? (
          <span className="inline-flex items-center gap-1">
            <Folder className="size-3.5 text-primary" />
            {menu.folderName}
          </span>
        ) : (
          "-"
        )}
      </TableCell>
      <TableCell>{menu.icon}</TableCell>
      <TableCell>
        <Badge variant={menu.enabled ? "default" : "outline"}>
          {menu.enabled ? "Ativo" : "Inativo"}
        </Badge>
      </TableCell>
      <TableCell>{menu.order}</TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <MoreVertical className="size-4" />
              <span className="sr-only">Abrir ações</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem asChild>
              <Link href={`/admin/menus/${menu.id}/edit`}>
                <Pencil className="mr-2 size-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-destructive"
              onSelect={(event) => {
                event.preventDefault();
                onDelete(menu);
              }}
            >
              <Trash2 className="mr-2 size-4" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}

export function MenuTable({ menus, page, pageSize, total, totalPages, q, sortBy, sortDir }: MenuTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(q);
  const [deleteTarget, setDeleteTarget] = useState<MenuListItem | null>(null);
  const [localMenus, setLocalMenus] = useState(menus);

  useEffect(() => {
    setSearch(q);
  }, [q]);

  useEffect(() => {
    setLocalMenus(menus);
  }, [menus]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const sortableIds = useMemo(() => localMenus.map((menu) => menu.id), [localMenus]);
  const allowReorder = !q && sortBy === "order" && sortDir === "asc";

  function buildQueryString(next: {
    q?: string;
    page?: number;
    sortBy?: "label" | "href" | "order" | "enabled";
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

  function toggleSort(column: "label" | "href" | "order" | "enabled") {
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

  async function confirmDelete() {
    if (!deleteTarget) return;
    await deleteMenuAction(deleteTarget.id);
    setDeleteTarget(null);
    router.refresh();
  }

  async function onDragEnd(event: DragEndEvent) {
    if (!allowReorder) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localMenus.findIndex((item) => item.id === active.id);
    const newIndex = localMenus.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const moved = arrayMove(localMenus, oldIndex, newIndex).map((item, index) => ({
      ...item,
      order: (page - 1) * pageSize + index + 1,
    }));
    setLocalMenus(moved);

    const result = await reorderMenusAction({
      orderedIds: moved.map((item) => item.id),
      startOrder: (page - 1) * pageSize + 1,
    });

    if (!result.ok) {
      toast.error(result.formError ?? "Falha ao reordenar menus.");
      setLocalMenus(menus);
      return;
    }

    toast.success("Ordem dos menus atualizada.");
    router.refresh();
  }

  const range = useMemo(() => {
    if (total === 0) return "0 resultados";
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    return `${start}-${end} de ${total}`;
  }, [page, pageSize, total]);

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit}>
        <Input
          placeholder="Buscar por nome, caminho ou ícone"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="md:max-w-sm"
          aria-label="Buscar menus"
        />
      </form>

      {allowReorder ? (
        <p className="text-muted-foreground text-sm">
          Arraste e solte os itens para reordenar.
        </p>
      ) : (
        <p className="text-muted-foreground text-sm">
          Para reordenar, limpe a busca e ordene por <strong>Ordem (asc)</strong>.
        </p>
      )}

      <div className="overflow-hidden rounded-lg border">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>
                  <button type="button" className="hover:underline" onClick={() => toggleSort("label")}>Nome</button>
                </TableHead>
                <TableHead>
                  <button type="button" className="hover:underline" onClick={() => toggleSort("href")}>Caminho</button>
                </TableHead>
                <TableHead>Pasta</TableHead>
                <TableHead>Ícone</TableHead>
                <TableHead>
                  <button type="button" className="hover:underline" onClick={() => toggleSort("enabled")}>Status</button>
                </TableHead>
                <TableHead>
                  <button type="button" className="hover:underline" onClick={() => toggleSort("order")}>Ordem</button>
                </TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
                {localMenus.length > 0 ? (
                  localMenus.map((menu) => (
                    <SortableMenuRow
                      key={menu.id}
                      menu={menu}
                      allowReorder={allowReorder}
                      onDelete={(item) => setDeleteTarget(item)}
                    />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center">
                      Nenhum menu encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground text-sm">{range}</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => navigateToPage(page - 1)}>Anterior</Button>
          <span className="text-sm">Página {page} de {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => navigateToPage(page + 1)}>Próxima</Button>
        </div>
      </div>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir menu</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não poderá ser desfeita.</AlertDialogDescription>
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
