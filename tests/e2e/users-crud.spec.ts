import { test, expect } from "@playwright/test";
import { hash } from "bcrypt";

import { prisma } from "../../lib/prisma";

test("full users CRUD", async ({ page }) => {
  const adminPassword = "admin123";
  const adminPasswordHash = await hash(adminPassword, 10);

  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  });

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
  });

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
  });

  const existingTestUser = await prisma.user.findUnique({
    where: { email: "gustavo@email.com" },
  });

  if (existingTestUser) {
    await prisma.userRole.deleteMany({ where: { userId: existingTestUser.id } });
    await prisma.user.delete({ where: { id: existingTestUser.id } });
  }

  await page.goto("/users/new");

  await page.fill("input[name=name]", "Gustavo");
  await page.fill("input[name=email]", "gustavo@email.com");
  await page.fill("input[id=password]", "123456");
  await page.fill("input[id=confirmPassword]", "123456");

  await page.getByRole("button", { name: "Save" }).click();

  await expect(page).toHaveURL(/\/users\/[0-9a-f-]+$/);
  await expect(page.getByRole("heading", { name: "Gustavo" })).toBeVisible();
});
