"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { mapTypeToSql } from "@/lib/dictionary/ddl";
import { fullTableName, quoteIdentifier } from "@/lib/security/sql";

function safeDefault(value: string | null) {
  if (!value) return null;
  return `'${value.replace(/'/g, "''")}'`;
}

function formatSqlError(error: unknown) {
  if (!(error instanceof Error)) return null;

  const sanitized = error.message
    .replace(/\s+/g, " ")
    .replace(/(password|secret|token)=\S+/gi, "$1=***")
    .trim();

  if (!sanitized) return null;
  return sanitized.length > 240 ? `${sanitized.slice(0, 240)}...` : sanitized;
}

export async function executeDictionaryAction(dictionaryId: string) {
  try {
    const table = await prisma.dictionaryTable.findUnique({
      where: { id: dictionaryId },
      include: { columns: { orderBy: { order: "asc" } } },
    });

    if (!table) {
      return { ok: false, formError: "Dicionário não encontrado." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

      const tableRef = fullTableName("public", table.name);
      await tx.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS ${tableRef} ("id" uuid primary key default gen_random_uuid())`);

      const existingColumnsRows = (await tx.$queryRawUnsafe(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = $1 AND table_name = $2`,
        "public",
        table.name,
      )) as Array<{ column_name: string }>;

      const existingColumns = new Set(existingColumnsRows.map((row) => row.column_name));

      for (const column of table.columns) {
        if (existingColumns.has(column.name)) continue;

        const parts = [quoteIdentifier(column.name), mapTypeToSql(column.type, column)];
        if (column.required) parts.push("NOT NULL");
        if (column.unique) parts.push("UNIQUE");

        if (column.type === "UUID" && column.autoGenerate) {
          parts.push("DEFAULT gen_random_uuid()");
        } else {
          const def = safeDefault(column.defaultValue);
          if (def) parts.push(`DEFAULT ${def}`);
        }

        await tx.$executeRawUnsafe(`ALTER TABLE ${tableRef} ADD COLUMN IF NOT EXISTS ${parts.join(" ")}`);

        if (column.type === "FK" && column.fkTableId) {
          const foreign = await tx.dictionaryTable.findUnique({ where: { id: column.fkTableId } });
          if (foreign) {
            const constraintName = `${table.name}_${column.name}_fkey`;
            await tx.$executeRawUnsafe(
              `ALTER TABLE ${tableRef} DROP CONSTRAINT IF EXISTS ${quoteIdentifier(constraintName)}`,
            );
            await tx.$executeRawUnsafe(
              `ALTER TABLE ${tableRef} ADD CONSTRAINT ${quoteIdentifier(constraintName)} FOREIGN KEY (${quoteIdentifier(column.name)}) REFERENCES ${fullTableName(foreign.schema, foreign.name)} (${quoteIdentifier(column.fkColumnName ?? "id")})`,
            );
          }
        }
      }

      await tx.dictionaryTable.update({
        where: { id: dictionaryId },
        data: { updatedAt: new Date() },
      });
    });

    try {
      revalidatePath(`/admin/dictionaries/${dictionaryId}`);
      revalidatePath(`/admin/dictionaries/${dictionaryId}/columns`);
      revalidatePath("/admin/dictionaries");
    } catch (revalidateError) {
      console.warn("executeDictionaryAction revalidate", revalidateError);
    }

    return { ok: true };
  } catch (error) {
    console.error("executeDictionaryAction", error);
    return {
      ok: false,
      formError: "A execução falhou. As alterações foram revertidas.",
      sqlError: formatSqlError(error),
    };
  }
}
