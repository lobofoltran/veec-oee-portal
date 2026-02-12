import { assertValidIdentifier } from "@/lib/security/identifiers";

export function quoteIdentifier(identifier: string): string {
  assertValidIdentifier(identifier);
  return `"${identifier.replace(/"/g, '""')}"`;
}

export function fullTableName(schema: string, table: string): string {
  assertValidIdentifier(schema, "schema");
  assertValidIdentifier(table, "table");
  return `${quoteIdentifier(schema)}.${quoteIdentifier(table)}`;
}
