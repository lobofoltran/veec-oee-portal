import { sqlQuery } from "@/lib/db/sql";
import type { DictionaryColumnType } from "@/lib/generated/prisma/client";
import { fullTableName, quoteIdentifier } from "@/lib/security/sql";
import type { ColumnMeta, TableMeta } from "@/lib/dictionary/types";

export function mapTypeToSql(type: DictionaryColumnType, column?: Pick<ColumnMeta, "length" | "precision" | "scale">): string {
  switch (type) {
    case "STRING":
      return `varchar(${column?.length ?? 255})`;
    case "TEXT":
      return "text";
    case "INT":
      return "integer";
    case "DECIMAL": {
      const precision = column?.precision ?? 12;
      const scale = column?.scale ?? 2;
      return `numeric(${precision},${scale})`;
    }
    case "BOOLEAN":
      return "boolean";
    case "DATE":
      return "date";
    case "DATETIME":
      return "timestamp with time zone";
    case "UUID":
      return "uuid";
    case "FK":
      return "uuid";
    case "SELECT":
      return "text";
    default:
      return "text";
  }
}

function buildColumnSql(column: ColumnMeta): string {
  const parts: string[] = [quoteIdentifier(column.name), mapTypeToSql(column.type, column)];

  if (column.required || column.isPrimaryKey) parts.push("NOT NULL");
  if (column.unique && !column.isPrimaryKey) parts.push("UNIQUE");

  const safeDefault = toSafeDefault(column);
  if (safeDefault) parts.push(`DEFAULT ${safeDefault}`);

  if (column.isPrimaryKey) parts.push("PRIMARY KEY");

  return parts.join(" ");
}

function toSafeDefault(column: ColumnMeta): string | null {
  const value = column.defaultValue;
  if (!value) {
    if (column.type === "UUID" && column.autoGenerate) return "gen_random_uuid()";
    return null;
  }

  if (column.type === "STRING" || column.type === "TEXT" || column.type === "DATE" || column.type === "DATETIME" || column.type === "SELECT") {
    return `'${value.replace(/'/g, "''")}'`;
  }

  if (column.type === "BOOLEAN") {
    if (value !== "true" && value !== "false") return null;
    return value;
  }

  if (column.type === "INT" || column.type === "DECIMAL") {
    if (!/^-?\d+(\.\d+)?$/.test(value)) return null;
    return value;
  }

  if (column.type === "UUID" || column.type === "FK") {
    return `'${value.replace(/'/g, "''")}'`;
  }

  return null;
}

export async function ensurePgCrypto() {
  await sqlQuery('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
}

export async function createPhysicalTable(meta: TableMeta) {
  await ensurePgCrypto();
  const tableRef = fullTableName(meta.schema, meta.name);

  const hasPrimaryKey = meta.columns.some((column) => column.isPrimaryKey);
  const cols = meta.columns.map(buildColumnSql);

  if (!hasPrimaryKey) {
    cols.unshift('"id" uuid primary key default gen_random_uuid()');
  }

  const sql = `CREATE TABLE IF NOT EXISTS ${tableRef} (${cols.join(", ")})`;
  await sqlQuery(sql);
}

export async function addColumn(tableMeta: TableMeta, column: ColumnMeta) {
  const tableRef = fullTableName(tableMeta.schema, tableMeta.name);
  const sql = `ALTER TABLE ${tableRef} ADD COLUMN IF NOT EXISTS ${buildColumnSql(column)}`;
  await sqlQuery(sql);
}

export async function updateColumn(_tableMeta: TableMeta, _column: ColumnMeta) {
  return;
}
