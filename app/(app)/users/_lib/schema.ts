import { z } from "zod"

const roleSchema = z.enum(["ADMIN", "MANAGER", "OPERATOR"])

export const createUserFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(120),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Enter a valid email.")
      .max(160),
    role: roleSchema,
    isActive: z.boolean().default(true),
    password: z.string().min(6, "Password must have at least 6 characters."),
    confirmPassword: z.string().min(1, "Please confirm password."),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      })
    }
  })

export const updateUserFormSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(120),
    email: z
      .string()
      .trim()
      .min(1, "Email is required.")
      .email("Enter a valid email.")
      .max(160),
    role: roleSchema,
    isActive: z.boolean().default(true),
  })

export const changePasswordSchema = z
  .object({
    password: z.string().min(6, "Password must have at least 6 characters."),
    confirmPassword: z.string().min(1, "Please confirm password."),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["confirmPassword"],
        message: "Passwords do not match.",
      })
    }
  })

export const listUsersQuerySchema = z.object({
  q: z.string().optional(),
  active: z.enum(["all", "active", "inactive"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
})

export function parseListUsersQuery(
  rawSearchParams: Record<string, string | string[] | undefined>
) {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value

  const parsed = listUsersQuerySchema.safeParse({
    q: first(rawSearchParams.q),
    active: first(rawSearchParams.active),
    page: first(rawSearchParams.page),
    pageSize: first(rawSearchParams.pageSize),
  })

  if (!parsed.success) {
    return {
      q: "",
      active: "all" as const,
      page: 1,
      pageSize: 10,
    }
  }

  return {
    q: parsed.data.q?.trim() ?? "",
    active: parsed.data.active,
    page: parsed.data.page,
    pageSize: parsed.data.pageSize,
  }
}
