import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { TableMeta } from "@/lib/dictionary/types";
import type { ReferenceOption } from "@/lib/dictionary/crud";
import { CrudSelectField } from "./crud-select-field";

function formatDateInput(value: unknown): string {
  if (!value) return "";
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function formatDateTimeLocalInput(value: unknown): string {
  if (!value) return "";
  const parsed = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return "";

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  const hours = String(parsed.getHours()).padStart(2, "0");
  const minutes = String(parsed.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function toInputValue(type: TableMeta["columns"][number]["type"], value: unknown): string {
  if (value == null) return "";

  if (type === "DATE") return formatDateInput(value);
  if (type === "DATETIME") return formatDateTimeLocalInput(value);

  return String(value);
}

export function CrudForm({
  table,
  row,
  selectOptions,
  submitLabel = "Salvar",
}: {
  table: TableMeta;
  row?: Record<string, unknown> | null;
  selectOptions: Record<string, ReferenceOption[]>;
  submitLabel?: string;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {table.columns.map((column) => {
          if (column.isPrimaryKey && column.name === "id") return null;

          const value = row?.[column.name];

          if (column.type === "BOOLEAN") {
            return (
              <div key={column.id} className="md:col-span-2 flex items-center gap-2 rounded-md border p-3">
                <input id={column.name} name={column.name} type="checkbox" defaultChecked={Boolean(value)} className="size-4" />
                <div>
                  <Label htmlFor={column.name}>{column.label}</Label>
                </div>
              </div>
            );
          }

          if (column.type === "TEXT") {
            return (
              <div key={column.id} className="space-y-2 md:col-span-2">
                <Label htmlFor={column.name}>{column.label}</Label>
                <Textarea
                  id={column.name}
                  name={column.name}
                  defaultValue={toInputValue(column.type, value)}
                  required={column.required}
                  aria-required={column.required}
                  placeholder="Digite um texto mais longo"
                />
              </div>
            );
          }

          if (column.type === "SELECT" || column.type === "FK") {
            const options = selectOptions[column.name] ?? [];

            return (
              <CrudSelectField
                key={column.id}
                id={column.name}
                name={column.name}
                label={column.label}
                required={column.required}
                defaultValue={value == null ? undefined : String(value)}
                options={options}
              />
            );
          }

          const inputType =
            column.type === "INT" || column.type === "DECIMAL"
              ? "number"
              : column.type === "DATE"
                ? "date"
                : column.type === "DATETIME"
                  ? "datetime-local"
                  : "text";

          return (
            <div key={column.id} className="space-y-2">
              <Label htmlFor={column.name}>{column.label}</Label>
              <Input
                id={column.name}
                name={column.name}
                type={inputType}
                defaultValue={toInputValue(column.type, value)}
                required={column.required}
                aria-required={column.required}
                step={column.type === "DECIMAL" ? "any" : undefined}
                placeholder={
                  column.type === "UUID"
                    ? "00000000-0000-0000-0000-000000000000"
                    : column.type === "DATE"
                      ? "Selecione uma data"
                      : column.type === "DATETIME"
                        ? "Selecione data e hora"
                        : ""
                }
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit">{submitLabel}</Button>
      </div>
    </div>
  );
}
