import { describe, expect, it } from "vitest";

import { isValidIdentifier } from "@/lib/security/identifiers";

describe("identifier validation", () => {
  it("accepts valid identifiers", () => {
    expect(isValidIdentifier("customers")).toBe(true);
    expect(isValidIdentifier("_internal_table")).toBe(true);
    expect(isValidIdentifier("column_1")).toBe(true);
  });

  it("rejects invalid identifiers", () => {
    expect(isValidIdentifier("1table")).toBe(false);
    expect(isValidIdentifier("users;drop table")).toBe(false);
    expect(isValidIdentifier("select")).toBe(false);
  });
});
