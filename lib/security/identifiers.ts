const IDENTIFIER_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
const SNAKE_CASE_LOWER_REGEX = /^[a-z_][a-z0-9_]*$/;

const RESERVED_WORDS = new Set([
  "select",
  "insert",
  "update",
  "delete",
  "drop",
  "table",
  "from",
  "where",
  "join",
  "alter",
  "create",
  "grant",
  "revoke",
  "truncate",
  "schema",
  "order",
  "group",
  "by",
]);

export function isValidIdentifier(value: string): boolean {
  if (!IDENTIFIER_REGEX.test(value)) return false;
  return !RESERVED_WORDS.has(value.toLowerCase());
}

export function isValidSnakeCaseIdentifier(value: string): boolean {
  if (!SNAKE_CASE_LOWER_REGEX.test(value)) return false;
  return !RESERVED_WORDS.has(value);
}

export function assertValidIdentifier(value: string, fieldName = "identifier") {
  if (!isValidIdentifier(value)) {
    throw new Error(`Invalid ${fieldName}: ${value}`);
  }
}
