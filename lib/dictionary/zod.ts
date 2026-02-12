import { z } from "zod";
import type { TableMeta } from "@/lib/dictionary/types";

function columnSchema(column: TableMeta["columns"][number]) {
  let schema: z.ZodType;

  switch (column.type) {
    case "STRING":
      schema = z.string().max(column.length ?? 255);
      break;
    case "TEXT":
      schema = z.string();
      break;
    case "INT":
      schema = z.coerce.number().int();
      break;
    case "DECIMAL":
      schema = z.coerce.number();
      break;
    case "BOOLEAN":
      schema = z.coerce.boolean();
      break;
    case "DATE":
    case "DATETIME":
      schema = z.string().min(1);
      break;
    case "UUID":
    case "FK":
      schema = z.string().uuid();
      break;
    case "SELECT": {
      const options = column.optionsJson ? safeParseOptions(column.optionsJson) : [];
      schema = options.length > 0 ? z.enum(options as [string, ...string[]]) : z.string().min(1);
      break;
    }
    default:
      schema = z.string();
  }

  return column.required ? schema : schema.optional().nullable();
}

function safeParseOptions(optionsJson: string): string[] {
  try {
    const parsed = JSON.parse(optionsJson) as Array<{ value?: string }>;
    return parsed.map((item) => item.value).filter((value): value is string => Boolean(value));
  } catch {
    return [];
  }
}

export function buildCreateSchema(tableMeta: TableMeta) {
  const shape: Record<string, z.ZodType> = {};

  for (const column of tableMeta.columns) {
    if (column.isPrimaryKey && column.name === "id") continue;
    shape[column.name] = columnSchema(column);
  }

  return z.object(shape);
}

export function buildUpdateSchema(tableMeta: TableMeta) {
  return buildCreateSchema(tableMeta).partial();
}
