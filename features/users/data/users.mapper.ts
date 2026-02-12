import { createUserSchema, type CreateUserInput } from "@/features/users/domain/schema"

export function toCreatePayload(input: CreateUserInput): CreateUserInput {
  return createUserSchema.parse(input)
}
