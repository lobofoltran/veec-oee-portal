import { sqlQuery } from "@/lib/db/sql";
import { getTableMeta } from "@/lib/dictionary/loader";
import type { TableMeta } from "@/lib/dictionary/types";
import { parseSelectOptions } from "@/lib/dictionary/types";
import { buildCreateSchema, buildUpdateSchema } from "@/lib/dictionary/zod";
import { prisma } from "@/lib/prisma";
import { fullTableName, quoteIdentifier } from "@/lib/security/sql";

type ListParams = {
  page?: number;
  pageSize?: number;
  sort?: string;
  direction?: "asc" | "desc";
  search?: string;
};

export type ReferenceOption = {
  value: string;
  label: string;
};

async function assertAccessibleTable(schema: string, table: string): Promise<TableMeta> {
  const meta = await getTableMeta(schema, table);

  if (!meta || meta.isSystem) {
    throw new Error("Tabela não permitida no dicionário.");
  }

  return meta;
}

export async function listRows(schema: string, table: string, params: ListParams = {}) {
  const meta = await assertAccessibleTable(schema, table);
  const requestedPage = Math.max(params.page ?? 1, 1);
  const pageSize = Math.min(Math.max(params.pageSize ?? 10, 1), 100);

  const sortable = new Set(meta.columns.map((c) => c.name).concat("id"));
  const sort = params.sort && sortable.has(params.sort) ? params.sort : "id";
  const direction = params.direction === "desc" ? "DESC" : "ASC";

  const tableRef = fullTableName(meta.schema, meta.name);

  let whereClause = "";
  const values: unknown[] = [];

  if (params.search) {
    const searchColumns = meta.columns.filter((c) => c.type === "STRING" || c.type === "TEXT" || c.type === "SELECT");
    if (searchColumns.length > 0) {
      values.push(`%${params.search}%`);
      const predicates = searchColumns.map((c) => `${quoteIdentifier(c.name)} ILIKE $1`).join(" OR ");
      whereClause = `WHERE (${predicates})`;
    }
  }

  const totalResult = await sqlQuery<{ count: string }>(
    `SELECT COUNT(*) as count FROM ${tableRef} ${whereClause}`,
    values,
  );
  const total = Number(totalResult.rows[0]?.count ?? 0);
  const totalPages = total === 0 ? 1 : Math.ceil(total / pageSize);
  const page = Math.min(requestedPage, totalPages);
  const offset = (page - 1) * pageSize;

  values.push(pageSize, offset);
  const rowsResult = await sqlQuery<Record<string, unknown>>(
    `SELECT * FROM ${tableRef} ${whereClause} ORDER BY ${quoteIdentifier(sort)} ${direction} LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );

  return {
    table: meta,
    rows: rowsResult.rows,
    total,
    page,
    pageSize,
    totalPages,
  };
}

export async function getRow(schema: string, table: string, id: string) {
  const meta = await assertAccessibleTable(schema, table);
  const tableRef = fullTableName(meta.schema, meta.name);

  const result = await sqlQuery<Record<string, unknown>>(
    `SELECT * FROM ${tableRef} WHERE "id" = $1 LIMIT 1`,
    [id],
  );

  return result.rows[0] ?? null;
}

export async function createRow(schema: string, table: string, input: Record<string, unknown>) {
  const meta = await assertAccessibleTable(schema, table);
  const parsed = buildCreateSchema(meta).safeParse(input);

  if (!parsed.success) {
    throw new Error("Dados inválidos para criação.");
  }

  await validateFk(meta, parsed.data as Record<string, unknown>);

  const entries = Object.entries(parsed.data).filter(([, value]) => value !== undefined);
  const tableRef = fullTableName(meta.schema, meta.name);
  const result =
    entries.length === 0
      ? await sqlQuery<Record<string, unknown>>(`INSERT INTO ${tableRef} DEFAULT VALUES RETURNING *`)
      : await sqlQuery<Record<string, unknown>>(
          `INSERT INTO ${tableRef} (${entries.map(([key]) => quoteIdentifier(key)).join(",")}) VALUES (${entries.map((_, index) => `$${index + 1}`).join(",")}) RETURNING *`,
          entries.map(([, value]) => value),
        );

  return result.rows[0] ?? null;
}

export async function updateRow(schema: string, table: string, id: string, input: Record<string, unknown>) {
  const meta = await assertAccessibleTable(schema, table);
  const parsed = buildUpdateSchema(meta).safeParse(input);

  if (!parsed.success) {
    throw new Error("Dados inválidos para atualização.");
  }

  await validateFk(meta, parsed.data as Record<string, unknown>);

  const entries = Object.entries(parsed.data).filter(([, value]) => value !== undefined);
  if (entries.length === 0) return getRow(schema, table, id);

  const sets = entries.map(([key], index) => `${quoteIdentifier(key)} = $${index + 1}`);
  const values = entries.map(([, value]) => value);
  values.push(id);

  const tableRef = fullTableName(meta.schema, meta.name);
  const result = await sqlQuery<Record<string, unknown>>(
    `UPDATE ${tableRef} SET ${sets.join(", ")} WHERE "id" = $${values.length} RETURNING *`,
    values,
  );

  return result.rows[0] ?? null;
}

export async function deleteRow(schema: string, table: string, id: string) {
  const meta = await assertAccessibleTable(schema, table);
  const tableRef = fullTableName(meta.schema, meta.name);

  await sqlQuery(`DELETE FROM ${tableRef} WHERE "id" = $1`, [id]);
}

export async function getReferenceOptionsByColumn(meta: TableMeta): Promise<Record<string, ReferenceOption[]>> {
  const result: Record<string, ReferenceOption[]> = {};

  for (const column of meta.columns) {
    if (column.type === "SELECT") {
      result[column.name] = parseSelectOptions(column);
      continue;
    }

    if (column.type !== "FK" || !column.fkTableId) continue;

    const foreignTable = await prisma.dictionaryTable.findUnique({
      where: { id: column.fkTableId },
    });
    if (!foreignTable) continue;

    const keyField = column.fkColumnName ?? "id";
    const displayField = column.displayField ?? keyField;

    const rows = await sqlQuery<Record<string, unknown>>(
      `SELECT ${quoteIdentifier(keyField)} as value, ${quoteIdentifier(displayField)} as label FROM ${fullTableName(foreignTable.schema, foreignTable.name)} ORDER BY ${quoteIdentifier(displayField)} ASC LIMIT 500`,
    );

    result[column.name] = rows.rows.map((row) => ({
      value: String(row.value ?? ""),
      label: String(row.label ?? row.value ?? ""),
    }));
  }

  return result;
}

export async function resolveReferenceLabels(meta: TableMeta, rows: Record<string, unknown>[]) {
  const maps: Record<string, Record<string, string>> = {};

  for (const column of meta.columns) {
    if (column.type === "SELECT") {
      maps[column.name] = Object.fromEntries(parseSelectOptions(column).map((option) => [option.value, option.label]));
      continue;
    }

    if (column.type !== "FK" || !column.fkTableId) continue;
    const ids = Array.from(new Set(rows.map((row) => row[column.name]).filter((value): value is string => typeof value === "string" && value.length > 0)));
    if (ids.length === 0) {
      maps[column.name] = {};
      continue;
    }

    const foreignTable = await prisma.dictionaryTable.findUnique({ where: { id: column.fkTableId } });
    if (!foreignTable) continue;

    const keyField = column.fkColumnName ?? "id";
    const displayField = column.displayField ?? keyField;

    const placeholders = ids.map((_, index) => `$${index + 1}`).join(",");
    const lookup = await sqlQuery<Record<string, unknown>>(
      `SELECT ${quoteIdentifier(keyField)} as value, ${quoteIdentifier(displayField)} as label FROM ${fullTableName(foreignTable.schema, foreignTable.name)} WHERE ${quoteIdentifier(keyField)} IN (${placeholders})`,
      ids,
    );

    maps[column.name] = Object.fromEntries(
      lookup.rows.map((item) => [String(item.value ?? ""), String(item.label ?? item.value ?? "")]),
    );
  }

  return maps;
}

async function validateFk(meta: TableMeta, input: Record<string, unknown>) {
  const fkColumns = meta.columns.filter((column) => column.type === "FK" && column.fkTableId);

  for (const column of fkColumns) {
    const value = input[column.name];
    if (!value) continue;

    const foreignTable = await prisma.dictionaryTable.findUnique({
      where: { id: column.fkTableId ?? undefined },
    });
    if (!foreignTable) {
      continue;
    }

    const fkColumn = column.fkColumnName ?? "id";
    const query = await sqlQuery(
      `SELECT 1 FROM ${fullTableName(foreignTable.schema, foreignTable.name)} WHERE ${quoteIdentifier(fkColumn)} = $1 LIMIT 1`,
      [value],
    );
    if (query.rows.length === 0) {
      throw new Error(`Registro relacionado não encontrado para ${column.label}.`);
    }
  }
}
