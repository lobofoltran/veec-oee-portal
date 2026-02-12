import { beforeAll, describe, expect, it } from "vitest";

import { addColumn, createPhysicalTable } from "@/lib/dictionary/ddl";
import { createRow } from "@/lib/dictionary/crud";
import { getTableMetaById } from "@/lib/dictionary/loader";
import { prisma } from "@/lib/prisma";
import { isDatabaseAvailable } from "./helpers/db-availability";

const dbAvailable = await isDatabaseAvailable();
const describeIfDb = dbAvailable ? describe : describe.skip;

describeIfDb("dictionary fk validation integration", () => {
  const schema = "public";
  const parentName = `it_parents_${Date.now()}`;
  const childName = `it_children_${Date.now()}`;

  let parentTableId = "";
  let childTableId = "";

  beforeAll(async () => {
    const parent = await prisma.dictionaryTable.create({
      data: { schema, name: parentName, label: "Parents" },
    });
    parentTableId = parent.id;

    const child = await prisma.dictionaryTable.create({
      data: { schema, name: childName, label: "Children" },
    });
    childTableId = child.id;

    const parentMeta = await getTableMetaById(parentTableId);
    if (!parentMeta) throw new Error("parent meta not found");
    await createPhysicalTable(parentMeta);

    const childMeta = await getTableMetaById(childTableId);
    if (!childMeta) throw new Error("child meta not found");
    await createPhysicalTable(childMeta);

    const parentLabel = await prisma.dictionaryColumn.create({
      data: {
        tableId: parentTableId,
        name: "label",
        label: "Label",
        type: "STRING",
        required: true,
        order: 1,
      },
    });

    const parentMeta2 = await getTableMetaById(parentTableId);
    if (!parentMeta2) throw new Error("parent meta not found");
    await addColumn(parentMeta2, {
      id: parentLabel.id,
      tableId: parentLabel.tableId,
      name: parentLabel.name,
      label: parentLabel.label,
      type: parentLabel.type,
      required: parentLabel.required,
      unique: parentLabel.unique,
      defaultValue: parentLabel.defaultValue,
      isPrimaryKey: parentLabel.isPrimaryKey,
      fkTableId: parentLabel.fkTableId,
      fkColumnName: parentLabel.fkColumnName,
      order: parentLabel.order,
    });

    const childFk = await prisma.dictionaryColumn.create({
      data: {
        tableId: childTableId,
        name: "parent_id",
        label: "Parent",
        type: "FK",
        fkTableId: parentTableId,
        fkColumnName: "id",
        required: true,
        order: 1,
      },
    });

    const childMeta2 = await getTableMetaById(childTableId);
    if (!childMeta2) throw new Error("child meta not found");
    await addColumn(childMeta2, {
      id: childFk.id,
      tableId: childFk.tableId,
      name: childFk.name,
      label: childFk.label,
      type: childFk.type,
      required: childFk.required,
      unique: childFk.unique,
      defaultValue: childFk.defaultValue,
      isPrimaryKey: childFk.isPrimaryKey,
      fkTableId: childFk.fkTableId,
      fkColumnName: childFk.fkColumnName,
      order: childFk.order,
    });
  });

  it("rejects missing fk row", async () => {
    await expect(
      createRow(schema, childName, { parent_id: "53fe39f0-a2f7-4d85-a1c2-df5d027ecf86" }),
    ).rejects.toThrow();
  });
});
