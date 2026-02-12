import { z } from "zod"

export const userRoleSchema = z.enum(["ADMIN", "MANAGER", "OPERATOR"])
export const userStatusSchema = z.enum(["ACTIVE", "INACTIVE"])

export const createUserSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  email: z.string().trim().min(1, "Required").email("Invalid email"),
  role: userRoleSchema,
  status: userStatusSchema,
})

export type CreateUserInput = z.infer<typeof createUserSchema>
