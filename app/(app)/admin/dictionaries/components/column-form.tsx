"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { createColumnAction } from "../actions/create-column";
import { updateColumnAction } from "../actions/update-column";
import { columnSchema, type ColumnFormInput } from "../schema/column.schema";

type ColumnRecord = {
  id: string;
  name: string;
  label: string;
  type: "STRING" | "TEXT" | "INT" | "DECIMAL" | "BOOLEAN" | "DATE" | "DATETIME" | "UUID" | "FK" | "SELECT";
  nullable: boolean;
  default: string;
  length?: number;
  precision?: number;
  scale?: number;
  order: number;
  autoGenerate?: boolean;
  fkTableId?: string | null;
  fkColumnName?: string | null;
  displayField?: string | null;
  options?: Array<{ value: string; label: string }>;
};

type DictionaryOption = {
  id: string;
  label: string;
  name: string;
  columns: Array<{ name: string; label: string }>;
};

const TYPE_OPTIONS: Array<{ value: ColumnFormInput["type"]; label: string }> = [
  { value: "string", label: "Texto" },
  { value: "number", label: "Número" },
  { value: "boolean", label: "Booleano" },
  { value: "date", label: "Data" },
  { value: "datetime", label: "Data e Hora" },
  { value: "text", label: "Texto Longo" },
  { value: "decimal", label: "Decimal" },
  { value: "uuid", label: "UUID" },
  { value: "reference", label: "Referência" },
  { value: "select", label: "Select" },
];

function dbToUiType(type: ColumnRecord["type"]): ColumnFormInput["type"] {
  switch (type) {
    case "STRING":
      return "string";
    case "INT":
      return "number";
    case "BOOLEAN":
      return "boolean";
    case "DATE":
      return "date";
    case "DATETIME":
      return "datetime";
    case "TEXT":
      return "text";
    case "DECIMAL":
      return "decimal";
    case "UUID":
      return "uuid";
    case "FK":
      return "reference";
    case "SELECT":
      return "select";
  }
}

function toDefaults(dictionaryId: string, initial?: ColumnRecord): ColumnFormInput {
  if (!initial) {
    return {
      dictionaryId,
      name: "",
      label: "",
      type: "string",
      nullable: true,
      default: "",
      order: 1,
      options: [],
    };
  }

  return {
    dictionaryId,
    name: initial.name,
    label: initial.label,
    type: dbToUiType(initial.type),
    nullable: initial.nullable,
    default: initial.default,
    length: initial.length,
    precision: initial.precision,
    scale: initial.scale,
    order: initial.order,
    autoGenerate: Boolean(initial.autoGenerate),
    fkTableId: initial.fkTableId ?? undefined,
    fkColumnName: initial.fkColumnName ?? "id",
    displayField: initial.displayField ?? "id",
    options: initial.options ?? [],
  };
}

export function ColumnForm({
  dictionaryId,
  mode,
  initial,
  dictionaries,
  onSuccess,
}: {
  dictionaryId: string;
  mode: "create" | "edit";
  initial?: ColumnRecord;
  dictionaries: DictionaryOption[];
  onSuccess?: () => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    control,
    setValue,
    watch,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ColumnFormInput>({
    resolver: zodResolver(columnSchema),
    defaultValues: toDefaults(dictionaryId, initial),
  });

  const { fields: optionFields, append, remove } = useFieldArray({
    control,
    name: "options",
  });

  const nullable = watch("nullable");
  const selectedType = watch("type");
  const fkTableId = watch("fkTableId");
  const watchedOptions = watch("options");

  const isStringLike = selectedType === "string" || selectedType === "text";
  const isNumeric = selectedType === "number" || selectedType === "decimal";
  const isBoolean = selectedType === "boolean";
  const isDateLike = selectedType === "date" || selectedType === "datetime";
  const isUuid = selectedType === "uuid";
  const isReference = selectedType === "reference";
  const isSelect = selectedType === "select";

  const selectedReferenceTable = useMemo(() => dictionaries.find((item) => item.id === fkTableId), [dictionaries, fkTableId]);

  async function onSubmit(values: ColumnFormInput) {
    setFormError(null);

    const result = mode === "create" ? await createColumnAction(values) : await updateColumnAction(initial!.id, values);

    if (!result.ok) {
      setFormError(result.formError ?? null);

      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) {
            setError(field as keyof ColumnFormInput, {
              type: "server",
              message: messages[0],
            });
          }
        }
      }

      return;
    }

    onSuccess?.();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {formError ? <p className="text-destructive text-sm">{formError}</p> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nome técnico *</Label>
          <Input id="name" placeholder="Ex.: nome_do_campo" {...register("name")} />
          {errors.name?.message ? <p className="text-destructive text-xs">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="label">Label *</Label>
          <Input id="label" placeholder="Ex.: Nome do Cliente" {...register("label")} />
          {errors.label?.message ? <p className="text-destructive text-xs">{errors.label.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Tipo *</Label>
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value !== "reference") {
                    setValue("fkTableId", undefined);
                    setValue("fkColumnName", undefined);
                    setValue("displayField", undefined);
                  }
                  if (value !== "select") {
                    setValue("options", []);
                  }
                }}
              >
                <SelectTrigger id="type" aria-invalid={Boolean(errors.type?.message)}>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.type?.message ? <p className="text-destructive text-xs">{errors.type.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="order">Ordem</Label>
          <Input id="order" type="number" placeholder="1" {...register("order", { valueAsNumber: true })} />
          {errors.order?.message ? <p className="text-destructive text-xs">{errors.order.message}</p> : null}
        </div>

        {(isStringLike || isNumeric || isDateLike || isBoolean || isSelect) ? (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="default">Valor padrão</Label>
            {isBoolean ? (
              <Controller
                control={control}
                name="default"
                render={({ field }) => (
                  <div className="flex items-center gap-2 rounded-md border p-3">
                    <Checkbox
                      checked={field.value === "true"}
                      onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                    />
                    <Label>Padrão verdadeiro</Label>
                  </div>
                )}
              />
            ) : isSelect ? (
              <Controller
                control={control}
                name="default"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger id="default"><SelectValue placeholder="Selecione o valor padrão" /></SelectTrigger>
                    <SelectContent>
                      {(watchedOptions ?? [])
                        .map((option, index) => ({
                          id: optionFields[index]?.id ?? String(index),
                          value: option.value?.trim() ?? "",
                          label: option.label?.trim() ?? "",
                        }))
                        .filter((option) => option.value.length > 0)
                        .map((option) => (
                          <SelectItem key={option.id} value={option.value}>
                            {option.label || option.value}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
            ) : (
              <Input
                id="default"
                type={isDateLike ? (selectedType === "date" ? "date" : "datetime-local") : isNumeric ? "number" : "text"}
                step={selectedType === "decimal" ? "any" : undefined}
                placeholder="Valor padrão opcional"
                {...register("default")}
              />
            )}
          </div>
        ) : null}

        {selectedType === "string" ? (
          <div className="space-y-2">
            <Label htmlFor="length">Tamanho</Label>
            <Input id="length" type="number" placeholder="Ex.: 255" {...register("length", { valueAsNumber: true })} />
            {errors.length?.message ? <p className="text-destructive text-xs">{errors.length.message}</p> : null}
          </div>
        ) : null}

        {isNumeric ? (
          <div className="space-y-2">
            <Label htmlFor="precision">Precisão</Label>
            <Input id="precision" type="number" placeholder="Ex.: 10" {...register("precision", { valueAsNumber: true })} />
            {errors.precision?.message ? <p className="text-destructive text-xs">{errors.precision.message}</p> : null}
          </div>
        ) : null}

        {selectedType === "decimal" ? (
          <div className="space-y-2">
            <Label htmlFor="scale">Escala</Label>
            <Input id="scale" type="number" placeholder="Ex.: 2" {...register("scale", { valueAsNumber: true })} />
            {errors.scale?.message ? <p className="text-destructive text-xs">{errors.scale.message}</p> : null}
          </div>
        ) : null}

        {isUuid ? (
          <div className="md:col-span-2 flex items-center gap-2 rounded-md border p-3">
            <Controller
              control={control}
              name="autoGenerate"
              render={({ field }) => (
                <>
                  <Checkbox checked={Boolean(field.value)} onCheckedChange={(checked) => field.onChange(Boolean(checked))} />
                  <div>
                    <Label>Gerar UUID automaticamente</Label>
                    <p className="text-muted-foreground text-xs">Ao executar, o banco cria valor padrão com gen_random_uuid().</p>
                  </div>
                </>
              )}
            />
          </div>
        ) : null}

        {isReference ? (
          <>
            <div className="space-y-2">
              <Label>Tabela de referência</Label>
              <Controller
                control={control}
                name="fkTableId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Selecione a tabela" /></SelectTrigger>
                    <SelectContent>
                      {dictionaries.filter((d) => d.id !== dictionaryId).map((dictionary) => (
                        <SelectItem key={dictionary.id} value={dictionary.id}>{dictionary.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.fkTableId?.message ? <p className="text-destructive text-xs">{errors.fkTableId.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label>Campo de exibição</Label>
              <Controller
                control={control}
                name="displayField"
                render={({ field }) => (
                  <Select value={field.value || "id"} onValueChange={field.onChange}>
                    <SelectTrigger><SelectValue placeholder="Selecione o campo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="id">id</SelectItem>
                      {(selectedReferenceTable?.columns ?? []).map((column) => (
                        <SelectItem key={column.name} value={column.name}>{column.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </>
        ) : null}

        {isSelect ? (
          <div className="space-y-3 md:col-span-2 rounded-md border p-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Opções do select</Label>
                <p className="text-muted-foreground text-xs">Cadastre e ordene as opções exibidas no formulário.</p>
              </div>
              <Button type="button" size="sm" variant="outline" onClick={() => append({ value: "", label: "" })}>
                <Plus className="mr-2 size-4" />
                Adicionar opção
              </Button>
            </div>
            {optionFields.length === 0 ? <p className="text-muted-foreground text-xs">Nenhuma opção cadastrada.</p> : null}
            {optionFields.map((field, index) => (
              <div key={field.id} className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                <Input placeholder="Valor" {...register(`options.${index}.value`)} />
                <Input placeholder="Label" {...register(`options.${index}.label`)} />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                  <Trash2 className="size-4" />
                </Button>
              </div>
            ))}
            {errors.options?.message ? <p className="text-destructive text-xs">{errors.options.message}</p> : null}
          </div>
        ) : null}

        <div className="md:col-span-2 flex items-center gap-2 rounded-md border p-3">
          <Checkbox id="nullable" checked={Boolean(nullable)} onCheckedChange={(checked) => setValue("nullable", Boolean(checked))} />
          <div>
            <Label htmlFor="nullable">Aceita nulo</Label>
            <p className="text-muted-foreground text-xs">Permite valores nulos neste campo.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : mode === "create" ? "Adicionar coluna" : "Salvar coluna"}</Button>
      </div>
    </form>
  );
}
