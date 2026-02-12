import { z } from "zod";

export const menuFormSchema = z
  .object({
    name: z.string().trim().min(1, "Nome é obrigatório."),
    path: z.string().trim(),
    icon: z.string().trim().optional(),
    folderId: z.string().uuid().nullable(),
    order: z.coerce.number().int().default(0),
    active: z.coerce.boolean().default(true),
    visible: z.coerce.boolean().default(true),
    isFolder: z.coerce.boolean().default(false),
  })
  .superRefine((values, ctx) => {
    if (!values.isFolder && values.path.length < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["path"],
        message: "Caminho é obrigatório.",
      });
    }
  });

export const listMenusQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["label", "href", "order", "enabled"]).default("order"),
  sortDir: z.enum(["asc", "desc"]).default("asc"),
});

export function parseListMenusQuery(rawSearchParams: Record<string, string | string[] | undefined>) {
  const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

  const parsed = listMenusQuerySchema.safeParse({
    q: first(rawSearchParams.q),
    page: first(rawSearchParams.page),
    pageSize: first(rawSearchParams.pageSize),
    sortBy: first(rawSearchParams.sortBy),
    sortDir: first(rawSearchParams.sortDir),
  });

  if (!parsed.success) {
    return { q: "", page: 1, pageSize: 10, sortBy: "order" as const, sortDir: "asc" as const };
  }

  return {
    q: parsed.data.q?.trim() ?? "",
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
    sortBy: parsed.data.sortBy,
    sortDir: parsed.data.sortDir,
  };
}

export type MenuFormInput = z.input<typeof menuFormSchema>;
export type MenuFormValues = z.infer<typeof menuFormSchema>;
