import { describe, it, expect } from "vitest"

import { toCreatePayload } from "@/features/users/data/users.mapper"

describe("Users Mapper", () => {
  it("maps form to payload", () => {
    const input = {
      name: "Gustavo",
      email: "gustavo@email.com",
      role: "ADMIN" as const,
      status: "ACTIVE" as const,
    }

    expect(toCreatePayload(input)).toEqual(input)
  })
})
