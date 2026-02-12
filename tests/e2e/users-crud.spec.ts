import { test, expect } from "@playwright/test"
import { hash } from "bcrypt"

import { prisma } from "../../lib/prisma"

test("full users CRUD", async ({ page }) => {
  const adminPassword = "admin123"
  const adminPasswordHash = await hash(adminPassword, 10)

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  })

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@veec.com" },
    update: {
      name: "Admin",
      password: adminPasswordHash,
      active: true,
    },
    create: {
      name: "Admin",
      email: "admin@veec.com",
      password: adminPasswordHash,
      active: true,
    },
  })

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: adminRole.id,
    },
  })

  const existingTestUser = await prisma.user.findUnique({
    where: { email: "gustavo@email.com" },
  })

  if (existingTestUser) {
    await prisma.userRole.deleteMany({
      where: { userId: existingTestUser.id },
    })
    await prisma.user.delete({
      where: { id: existingTestUser.id },
    })
  }

  await page.goto("/login")

  await page.getByLabel("Email").fill("")
  await page.getByLabel("Email").fill("admin@veec.com")
  await page.getByLabel("Password").fill("")
  await page.getByLabel("Password").fill(adminPassword)
  await page.click("text=Login")
  await page.waitForURL(/\/dashboard|\/users/, { timeout: 15000 })

  await page.goto("/users")

  await page.click("text=New User")

  await page.fill("input[name=name]", "Gustavo")
  await page.fill("input[name=email]", "gustavo@email.com")
  await page.fill("input[id=password]", "123456")
  await page.fill("input[id=confirmPassword]", "123456")

  await page.click("text=Save")

  await expect(page.getByRole("heading", { name: "Gustavo" })).toBeVisible()

  await prisma.$disconnect()
})
