import { z } from "zod"

function normalizeText(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function normalizeDigits(value?: string) {
  const digits = value?.replace(/\D/g, "")
  return digits ? digits : undefined
}

const emailValidator = z.string().email()

const baseFactoryFormSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Code is required.")
    .max(32, "Code must have at most 32 characters."),
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(120, "Name must have at most 120 characters."),
  legalName: z.string().max(160, "Legal name is too long.").optional(),
  document: z.string().max(24, "Document is too long.").optional(),
  email: z.string().max(160, "Email is too long.").optional(),
  phone: z.string().max(32, "Phone is too long.").optional(),
  addressLine1: z.string().max(160, "Address line 1 is too long.").optional(),
  addressLine2: z.string().max(160, "Address line 2 is too long.").optional(),
  city: z.string().max(80, "City is too long.").optional(),
  state: z.string().max(16, "State is too long.").optional(),
  zip: z.string().max(16, "ZIP is too long.").optional(),
  isActive: z.boolean().default(true),
})

export const factoryFormSchema = baseFactoryFormSchema.superRefine(
  (values, ctx) => {
    const normalizedEmail = normalizeText(values.email)?.toLowerCase()

    if (
      normalizedEmail &&
      !emailValidator.safeParse(normalizedEmail).success
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "Enter a valid email.",
      })
    }
  }
)

export const createFactorySchema = factoryFormSchema.transform((values) => ({
  code: values.code.trim().toUpperCase(),
  name: values.name.trim(),
  legalName: normalizeText(values.legalName),
  document: normalizeDigits(values.document),
  email: normalizeText(values.email)?.toLowerCase(),
  phone: normalizeText(values.phone),
  addressLine1: normalizeText(values.addressLine1),
  addressLine2: normalizeText(values.addressLine2),
  city: normalizeText(values.city),
  state: normalizeText(values.state)?.toUpperCase(),
  zip: normalizeDigits(values.zip),
  isActive: values.isActive,
}))

export const updateFactorySchema = createFactorySchema

export const listFactoriesQuerySchema = z.object({
  q: z.string().optional(),
  active: z.enum(["all", "active", "inactive"]).default("all"),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
})

export function parseListFactoriesQuery(
  rawSearchParams: Record<string, string | string[] | undefined>
) {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value

  const parsed = listFactoriesQuerySchema.safeParse({
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
