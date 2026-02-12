import { describe, expect, it } from "vitest";

import type { TableMeta } from "@/lib/dictionary/types";
import { buildCreateSchema } from "@/lib/dictionary/zod";

describe("dictionary zod builder", () => {
  const meta = {
    id: "t1",
    schema: "public",
    name: "customers",
    label: "Customers",
    description: null,
    isSystem: false,
    columns: [
      { id: "c1", tableId: "t1", name: "name", label: "Name", type: "STRING", required: true, unique: false, defaultValue: null, isPrimaryKey: false, fkTableId: null, fkColumnName: null, order: 1 },
      { id: "c2", tableId: "t1", name: "active", label: "Active", type: "BOOLEAN", required: false, unique: false, defaultValue: null, isPrimaryKey: false, fkTableId: null, fkColumnName: null, order: 2 },
    ],
  } as unknown as TableMeta;

  it("validates required fields", () => {
    const schema = buildCreateSchema(meta);
    expect(schema.safeParse({ name: "A" }).success).toBe(true);
    expect(schema.safeParse({}).success).toBe(false);
  });
});
