import { describe, expect, it } from "vitest";

import { createColumnAction } from "@/app/(app)/admin/dictionaries/actions/create-column";
import { prisma } from "@/lib/prisma";

describe("create column action type mapping integration", () => {
  it("creates non-text column types without requiring post-edit", async () => {
    const suffix = Date.now();
    const table = await prisma.dictionaryTable.create({
      data: {
        schema: "public",
        name: `it_type_map_${suffix}`,
        label: `IT Type Map ${suffix}`,
      },
    });

    try {
      const booleanResult = await createColumnAction({
        dictionaryId: table.id,
        name: "is_active",
        label: "Ativo",
        type: "boolean",
        nullable: true,
        default: "true",
        order: 1,
        options: [],
      });
      expect(booleanResult.ok).toBe(true);

      const dateResult = await createColumnAction({
        dictionaryId: table.id,
        name: "start_date",
        label: "Data inicial",
        type: "date",
        nullable: true,
        default: "",
        order: 2,
        options: [],
      });
      expect(dateResult.ok).toBe(true);

      const decimalResult = await createColumnAction({
        dictionaryId: table.id,
        name: "amount",
        label: "Valor",
        type: "decimal",
        nullable: true,
        default: "",
        precision: 10,
        scale: 2,
        order: 3,
        options: [],
      });
      expect(decimalResult.ok).toBe(true);

      const rows = await prisma.dictionaryColumn.findMany({
        where: { tableId: table.id },
        orderBy: { order: "asc" },
      });

      expect(rows.map((item) => item.type)).toEqual(["BOOLEAN", "DATE", "DECIMAL"]);
    } finally {
      await prisma.dictionaryColumn.deleteMany({ where: { tableId: table.id } });
      await prisma.dictionaryTable.delete({ where: { id: table.id } });
    }
  });
});
