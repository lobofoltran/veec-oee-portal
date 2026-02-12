import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

import { UserForm } from "@/features/users/ui/UserForm"

describe("UserForm", () => {
  it("renders fields", () => {
    render(<UserForm mode="create" />)

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it("validates required fields", async () => {
    const user = userEvent.setup()

    render(<UserForm mode="create" />)

    await user.click(screen.getByText(/save/i))

    expect(await screen.findAllByText(/required/i)).toHaveLength(2)
  })
})
