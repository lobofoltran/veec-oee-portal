import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"

import { UsersTable } from "@/features/users/ui/UsersTable"

describe("UsersTable", () => {
  it("renders users list", async () => {
    render(<UsersTable />)

    expect(await screen.findByText("Gustavo")).toBeInTheDocument()
  })
})
