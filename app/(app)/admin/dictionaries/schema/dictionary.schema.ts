import { z } from "zod";

import { isValidSnakeCaseIdentifier } from "@/lib/security/identifiers";

export const dictionarySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nome técnico é obrigatório.")
    .refine(
      isValidSnakeCaseIdentifier,
      "Nome da tabela inválido. Use apenas letras minúsculas, números e underscore (ex.: nome_da_tabela).",
    ),
  label: z.string().trim().min(1, "Label é obrigatório."),
  description: z.string().trim().optional(),
  schema: z.literal("public").default("public"),
  active: z.coerce.boolean().default(true),
});

export const listDictionariesQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["name", "createdAt", "columns", "active"]).default("createdAt"),
  sortDir: z.enum(["asc", "desc"]).default("desc"),
});

export type DictionaryFormInput = z.input<typeof dictionarySchema>;
export type DictionaryFormValues = z.infer<typeof dictionarySchema>;

export function parseDictionariesQuery(raw: Record<string, string | string[] | undefined>) {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  const parsed = listDictionariesQuerySchema.safeParse({
    q: first(raw.q),
    page: first(raw.page),
    pageSize: first(raw.pageSize),
    sortBy: first(raw.sortBy),
    sortDir: first(raw.sortDir),
  });

  if (!parsed.success) {
    return { q: "", page: 1, pageSize: 10, sortBy: "createdAt" as const, sortDir: "desc" as const };
  }

  return {
    q: parsed.data.q?.trim() ?? "",
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
    sortBy: parsed.data.sortBy,
    sortDir: parsed.data.sortDir,
  };
}
