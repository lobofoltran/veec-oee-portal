"use client";

import { useEffect, useMemo, useState } from "react";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

import { deleteColumnAction } from "../actions/delete-column";
import { reorderColumnsAction } from "../actions/reorder-columns";

type ColumnRow = {
  id: string;
  name: string;
  label: string;
  type: string;
  nullable: boolean;
  defaultValue: string | null;
  order: number;
};

function SortableRow({ row, onEdit, onDelete }: { row: ColumnRow; onEdit: (row: ColumnRow) => void; onDelete: (id: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: row.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className="hover:bg-muted/40">
      <TableCell className="w-10">
        <button type="button" className="text-muted-foreground hover:text-foreground cursor-grab" {...attributes} {...listeners} aria-label="Arrastar coluna">
          <GripVertical className="size-4" />
        </button>
      </TableCell>
      <TableCell className="font-medium">{row.label}</TableCell>
      <TableCell className="text-muted-foreground text-xs">{row.name}</TableCell>
      <TableCell><Badge variant="secondary">{row.type}</Badge></TableCell>
      <TableCell><Badge variant={row.nullable ? "outline" : "default"}>{row.nullable ? "Sim" : "Não"}</Badge></TableCell>
      <TableCell>{row.defaultValue || "-"}</TableCell>
      <TableCell>{row.order}</TableCell>
      <TableCell className="text-right">
        <div className="inline-flex gap-1">
          <Button variant="ghost" size="icon" className="size-8" onClick={() => onEdit(row)}><Pencil className="size-4" /></Button>
          <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => onDelete(row.id)}><Trash2 className="size-4" /></Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function ColumnsTable({ rows, dictionaryId, onEdit, onRefresh }: { rows: ColumnRow[]; dictionaryId: string; onEdit: (column: ColumnRow) => void; onRefresh: () => void }) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [localRows, setLocalRows] = useState(rows);

  useEffect(() => {
    setLocalRows(rows);
  }, [rows]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const ids = useMemo(() => localRows.map((row) => row.id), [localRows]);

  async function confirmDelete() {
    if (!deleteId) return;
    await deleteColumnAction(deleteId, dictionaryId);
    setDeleteId(null);
    onRefresh();
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localRows.findIndex((item) => item.id === active.id);
    const newIndex = localRows.findIndex((item) => item.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const moved = arrayMove(localRows, oldIndex, newIndex).map((item, index) => ({ ...item, order: index + 1 }));
    setLocalRows(moved);
    await reorderColumnsAction({ dictionaryId, orderedIds: moved.map((item) => item.id) });
    onRefresh();
  }

  return (
    <>
      <div className="overflow-hidden rounded-lg border">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-10"></TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Aceita nulo</TableHead>
                <TableHead>Padrão</TableHead>
                <TableHead>Ordem</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                {localRows.length > 0 ? (
                  localRows.map((row) => (
                    <SortableRow key={row.id} row={row} onEdit={onEdit} onDelete={(id) => setDeleteId(id)} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="py-10 text-center">Nenhum rascunho de coluna cadastrado.</TableCell>
                  </TableRow>
                )}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </div>

      <AlertDialog open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir rascunho de coluna</AlertDialogTitle>
            <AlertDialogDescription>Isso remove apenas o metadado antes da execução.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
