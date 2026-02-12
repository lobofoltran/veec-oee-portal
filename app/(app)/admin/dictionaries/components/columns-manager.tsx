"use client";

import { useMemo, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useRouter } from "next/navigation";

import { executeDictionaryAction } from "../actions/execute-dictionary";
import { ColumnForm } from "./column-form";
import { ColumnsTable } from "./columns-table";

type ColumnRecord = {
  id: string;
  name: string;
  label: string;
  type: "STRING" | "TEXT" | "INT" | "DECIMAL" | "BOOLEAN" | "DATE" | "DATETIME" | "UUID" | "FK" | "SELECT";
  required: boolean;
  defaultValue: string | null;
  order: number;
  length?: number | null;
  precision?: number | null;
  scale?: number | null;
  autoGenerate?: boolean;
  fkTableId?: string | null;
  fkColumnName?: string | null;
  displayField?: string | null;
  optionsJson?: string | null;
};

type DictionaryOption = {
  id: string;
  label: string;
  name: string;
  columns: Array<{ name: string; label: string }>;
};

export function ColumnsManager({ dictionaryId, initialColumns, dictionaries }: { dictionaryId: string; initialColumns: ColumnRecord[]; dictionaries: DictionaryOption[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<ColumnRecord | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [confirmExecute, setConfirmExecute] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executed, setExecuted] = useState(false);
  const [isPending, startTransition] = useTransition();

  const rows = useMemo(
    () =>
      initialColumns.map((column) => ({
        id: column.id,
        name: column.name,
        label: column.label,
        type: column.type,
        nullable: !column.required,
        defaultValue: column.defaultValue,
        order: column.order,
      })),
    [initialColumns]
  );

  function refresh() {
    router.refresh();
  }

  async function execute() {
    if (isPending) return;

    setExecutionError(null);

    startTransition(() => {
      void executeDictionaryAction(dictionaryId).then((result) => {
        if (!result.ok) {
          const message = result.sqlError ?? result.formError ?? "Falha na execução.";
          setExecutionError(message);
          toast.error(result.formError ?? "Falha ao executar estrutura", {
            description: result.sqlError,
          });
          return;
        }

        toast.success("Estrutura executada com sucesso");
        setExecuted(true);
        setConfirmExecute(false);
        router.refresh();
      });
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button onClick={() => setCreateOpen(true)}>Nova coluna</Button>
        <div className="flex items-center gap-2">
          {executed ? <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">Executado</Badge> : null}
          <Button onClick={() => setConfirmExecute(true)} variant="default" disabled={isPending}>
            {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            {isPending ? "Executando..." : "Executar"}
          </Button>
        </div>
      </div>

      {executionError ? <p className="text-destructive text-sm">{executionError}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Rascunho de colunas</CardTitle>
        </CardHeader>
        <CardContent>
          <ColumnsTable
            rows={rows}
            dictionaryId={dictionaryId}
            onRefresh={refresh}
            onEdit={(column) => {
              const original = initialColumns.find((item) => item.id === column.id);
              if (original) setEditing(original);
            }}
          />
        </CardContent>
      </Card>

      {createOpen ? (
        <Card>
          <CardHeader>
            <CardTitle>Criar coluna</CardTitle>
          </CardHeader>
          <CardContent>
            <ColumnForm dictionaryId={dictionaryId} mode="create" dictionaries={dictionaries} onSuccess={() => { setCreateOpen(false); refresh(); }} />
          </CardContent>
        </Card>
      ) : null}

      {editing ? (
        <Card>
          <CardHeader>
            <CardTitle>Editar coluna</CardTitle>
          </CardHeader>
          <CardContent>
            <ColumnForm
              dictionaryId={dictionaryId}
              mode="edit"
              dictionaries={dictionaries}
              initial={{
                id: editing.id,
                name: editing.name,
                label: editing.label,
                type: editing.type,
                nullable: !editing.required,
                default: editing.defaultValue || "",
                length: editing.length ?? undefined,
                precision: editing.precision ?? undefined,
                scale: editing.scale ?? undefined,
                autoGenerate: Boolean(editing.autoGenerate),
                fkTableId: editing.fkTableId,
                fkColumnName: editing.fkColumnName,
                displayField: editing.displayField,
                options: editing.optionsJson ? JSON.parse(editing.optionsJson) : [],
                order: editing.order,
              }}
              onSuccess={() => {
                setEditing(null);
                refresh();
              }}
            />
          </CardContent>
        </Card>
      ) : null}

      <AlertDialog open={confirmExecute} onOpenChange={setConfirmExecute}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Executar estrutura do dicionário</AlertDialogTitle>
            <AlertDialogDescription>Isso irá criar/atualizar a estrutura física da tabela. Deseja continuar?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={execute} disabled={isPending}>
              {isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              {isPending ? "Executando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
