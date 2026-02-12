import { expect, test } from "@playwright/test";

import { prisma } from "../../lib/prisma";

test("dictionary CRUD + select column + menu helper", async ({ page }) => {
  const tableName = `customers_e2e_${Date.now()}`;

  await page.goto("/admin/dictionaries/new");

  await page.locator("#name").fill(tableName);
  await page.locator("#label").fill("Customers");
  await page.getByRole("button", { name: "Criar dicionário" }).click();

  await page.waitForURL(/\/admin\/dictionaries\/[0-9a-f-]+$/);
  const dictionaryId = page.url().split("/").pop()!;

  await prisma.dictionaryColumn.create({
    data: {
      tableId: dictionaryId,
      name: "status",
      label: "Status",
      type: "SELECT",
      required: false,
      order: 1,
      optionsJson: JSON.stringify([{ value: "open", label: "Aberto" }]),
    },
  });

  await page.getByRole("link", { name: "Gerenciar colunas" }).click();
  await page.waitForURL(`/admin/dictionaries/${dictionaryId}/columns`);
  await page.getByRole("button", { name: "Executar" }).click();
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page.getByText("Executado")).toBeVisible({ timeout: 15000 });

  await page.goto(`/crud/public/${tableName}`);
  await page.getByRole("link", { name: "Novo registro" }).click();
  await page.locator("#status").click();
  await page.getByRole("option", { name: "Aberto" }).click();
  await page.getByRole("button", { name: "Salvar" }).click();
  await page.waitForURL(new RegExp(`/crud/public/${tableName}`));

  await page.getByRole("button", { name: "Ações de novo registro" }).click();
  await page.getByRole("menuitem", { name: "Criar atalho no menu" }).click();
  await page.getByRole("button", { name: "Criar menu" }).click();

  await page.goto("/dashboard");
  await expect(page.getByRole("link", { name: "Customers" }).first()).toBeVisible();
});
