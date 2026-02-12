import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import type { TableMeta } from "@/lib/dictionary/types";

type DictionaryTableWithColumns = Prisma.DictionaryTableGetPayload<{
  include: { columns: true };
}>;

function mapTable(table: DictionaryTableWithColumns): TableMeta {
  return {
    id: table.id,
    schema: table.schema,
    name: table.name,
    label: table.label,
    description: table.description,
    isSystem: table.isSystem,
    columns: table.columns
      .sort((a, b) => a.order - b.order)
      .map((column) => ({
        id: column.id,
        tableId: column.tableId,
        name: column.name,
        label: column.label,
        type: column.type,
        required: column.required,
        unique: column.unique,
        defaultValue: column.defaultValue,
        isPrimaryKey: column.isPrimaryKey,
        fkTableId: column.fkTableId,
        fkColumnName: column.fkColumnName,
        displayField: column.displayField,
        optionsJson: column.optionsJson,
        autoGenerate: column.autoGenerate,
        length: column.length,
        precision: column.precision,
        scale: column.scale,
        order: column.order,
      })),
  };
}

export async function listTables() {
  return prisma.dictionaryTable.findMany({
    include: {
      columns: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: [{ schema: "asc" }, { name: "asc" }],
  });
}

export async function getTableMetaById(tableId: string): Promise<TableMeta | null> {
  const table = await prisma.dictionaryTable.findUnique({
    where: { id: tableId },
    include: { columns: { orderBy: { order: "asc" } } },
  });

  return table ? mapTable(table) : null;
}

export async function getTableMeta(schema: string, name: string): Promise<TableMeta | null> {
  const table = await prisma.dictionaryTable.findUnique({
    where: {
      schema_name: {
        schema,
        name,
      },
    },
    include: { columns: { orderBy: { order: "asc" } } },
  });

  return table ? mapTable(table) : null;
}
