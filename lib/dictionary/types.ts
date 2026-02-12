import type { DictionaryColumnType } from "@/lib/generated/prisma/client";

export type TableMeta = {
  id: string;
  schema: string;
  name: string;
  label: string;
  description: string | null;
  isSystem: boolean;
  columns: ColumnMeta[];
};

export type SelectOption = {
  value: string;
  label: string;
};

export type ColumnMeta = {
  id: string;
  tableId: string;
  name: string;
  label: string;
  type: DictionaryColumnType;
  required: boolean;
  unique: boolean;
  defaultValue: string | null;
  isPrimaryKey: boolean;
  fkTableId: string | null;
  fkColumnName: string | null;
  displayField?: string | null;
  optionsJson?: string | null;
  autoGenerate?: boolean;
  length?: number | null;
  precision?: number | null;
  scale?: number | null;
  order: number;
};

export function parseSelectOptions(column: Pick<ColumnMeta, "optionsJson">): SelectOption[] {
  if (!column.optionsJson) return [];

  try {
    const parsed = JSON.parse(column.optionsJson) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const value = "value" in item ? String((item as { value?: unknown }).value ?? "") : "";
        const label = "label" in item ? String((item as { label?: unknown }).label ?? value) : value;
        if (!value) return null;
        return { value, label };
      })
      .filter((item): item is SelectOption => Boolean(item));
  } catch {
    return [];
  }
}
