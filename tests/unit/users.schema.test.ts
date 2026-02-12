import { describe, it, expect } from "vitest"

import { createUserSchema } from "@/features/users/domain/schema"

describe("User Schema", () => {
  it("validates correct data", () => {
    const result = createUserSchema.safeParse({
      name: "Gustavo",
      email: "gustavo@email.com",
      role: "ADMIN",
      status: "ACTIVE",
    })

    expect(result.success).toBe(true)
  })

  it("fails invalid email", () => {
    const result = createUserSchema.safeParse({
      name: "Gustavo",
      email: "invalid",
      role: "ADMIN",
      status: "ACTIVE",
    })

    expect(result.success).toBe(false)
  })
})
