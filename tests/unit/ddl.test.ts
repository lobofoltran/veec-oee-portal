import { describe, expect, it } from "vitest";

import { mapTypeToSql } from "@/lib/dictionary/ddl";

describe("ddl mapping", () => {
  it("maps dictionary types to postgres types", () => {
    expect(mapTypeToSql("STRING")).toBe("varchar(255)");
    expect(mapTypeToSql("TEXT")).toBe("text");
    expect(mapTypeToSql("INT")).toBe("integer");
    expect(mapTypeToSql("DECIMAL")).toBe("numeric(12,2)");
    expect(mapTypeToSql("BOOLEAN")).toBe("boolean");
    expect(mapTypeToSql("DATE")).toBe("date");
    expect(mapTypeToSql("DATETIME")).toBe("timestamp with time zone");
    expect(mapTypeToSql("UUID")).toBe("uuid");
    expect(mapTypeToSql("FK")).toBe("uuid");
  });
});
