import { beforeAll, describe, expect, it } from "vitest";

import { addColumn, createPhysicalTable } from "@/lib/dictionary/ddl";
import { createRow, deleteRow, listRows, updateRow } from "@/lib/dictionary/crud";
import { getTableMetaById } from "@/lib/dictionary/loader";
import { prisma } from "@/lib/prisma";
import { isDatabaseAvailable } from "./helpers/db-availability";

const dbAvailable = await isDatabaseAvailable();
const describeIfDb = dbAvailable ? describe : describe.skip;

describeIfDb("dictionary + ddl + crud integration", () => {
  let tableId = "";
  const schema = "public";
  const tableName = `it_customers_${Date.now()}`;

  beforeAll(async () => {
    await prisma.dictionaryColumn.deleteMany({ where: { table: { name: tableName } } });
    await prisma.dictionaryTable.deleteMany({ where: { name: tableName } });

    const table = await prisma.dictionaryTable.create({
      data: {
        schema,
        name: tableName,
        label: "Integration Customers",
      },
    });

    tableId = table.id;
    const meta = await getTableMetaById(table.id);
    if (!meta) throw new Error("table meta not found");
    await createPhysicalTable(meta);

    const nameCol = await prisma.dictionaryColumn.create({
      data: {
        tableId,
        name: "name",
        label: "Name",
        type: "STRING",
        required: true,
        order: 1,
      },
    });

    const metaAfterName = await getTableMetaById(table.id);
    if (!metaAfterName) throw new Error("table meta not found");
    await addColumn(metaAfterName, {
      id: nameCol.id,
      tableId: nameCol.tableId,
      name: nameCol.name,
      label: nameCol.label,
      type: nameCol.type,
      required: nameCol.required,
      unique: nameCol.unique,
      defaultValue: nameCol.defaultValue,
      isPrimaryKey: nameCol.isPrimaryKey,
      fkTableId: nameCol.fkTableId,
      fkColumnName: nameCol.fkColumnName,
      order: nameCol.order,
    });

    const activeCol = await prisma.dictionaryColumn.create({
      data: {
        tableId,
        name: "active",
        label: "Active",
        type: "BOOLEAN",
        required: false,
        order: 2,
      },
    });

    const metaAfterActive = await getTableMetaById(table.id);
    if (!metaAfterActive) throw new Error("table meta not found");
    await addColumn(metaAfterActive, {
      id: activeCol.id,
      tableId: activeCol.tableId,
      name: activeCol.name,
      label: activeCol.label,
      type: activeCol.type,
      required: activeCol.required,
      unique: activeCol.unique,
      defaultValue: activeCol.defaultValue,
      isPrimaryKey: activeCol.isPrimaryKey,
      fkTableId: activeCol.fkTableId,
      fkColumnName: activeCol.fkColumnName,
      order: activeCol.order,
    });
  });

  it("creates, lists, updates and deletes rows", async () => {
    const created = await createRow(schema, tableName, { name: "Alice", active: true });
    expect(created).toBeTruthy();

    const listed = await listRows(schema, tableName, { page: 1, pageSize: 10 });
    expect(listed.rows.length).toBeGreaterThan(0);

    const id = String(created?.id);
    const updated = await updateRow(schema, tableName, id, { name: "Alice Updated" });
    expect(updated?.name).toBe("Alice Updated");

    await deleteRow(schema, tableName, id);
    const listedAfterDelete = await listRows(schema, tableName, { page: 1, pageSize: 10 });
    expect(listedAfterDelete.rows.find((row) => String(row.id) === id)).toBeUndefined();
  });

  it("rejects unknown table", async () => {
    await expect(listRows(schema, "unknown_table_xyz", {})).rejects.toThrow();
  });
});
