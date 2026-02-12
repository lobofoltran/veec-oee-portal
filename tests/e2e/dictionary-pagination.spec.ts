import { expect, test } from "@playwright/test";

import { prisma } from "../../lib/prisma";

test("dicionário com +100 registros deve paginar corretamente", async ({ page }) => {
  const tableName = `transacoes_e2e_${Date.now()}`;
  const label = `Transações E2E ${Date.now()}`;

  await page.goto("/admin/dictionaries/new");

  await page.locator("#name").fill(tableName);
  await page.locator("#label").fill(label);
  await page.locator("#description").fill("Teste E2E de paginação com mais de 100 registros");
  await page.getByRole("button", { name: "Criar dicionário" }).click();

  await page.waitForURL(/\/admin\/dictionaries\/[0-9a-f-]+$/);
  const dictionaryId = page.url().split("/").pop();
  if (!dictionaryId) throw new Error("Não foi possível extrair o ID do dicionário.");

  await prisma.dictionaryColumn.createMany({
    data: [
      {
        tableId: dictionaryId,
        name: "descricao",
        label: "Descrição",
        type: "TEXT",
        required: true,
        order: 1,
      },
      {
        tableId: dictionaryId,
        name: "valor",
        label: "Valor",
        type: "DECIMAL",
        required: false,
        precision: 12,
        scale: 2,
        order: 2,
      },
    ],
  });

  await page.getByRole("link", { name: "Gerenciar colunas" }).click();
  await page.waitForURL(`/admin/dictionaries/${dictionaryId}/columns`);
  await page.getByRole("button", { name: "Executar" }).click();
  await page.getByRole("button", { name: "Confirmar" }).click();
  await expect(page.getByText("Executado")).toBeVisible({ timeout: 15000 });

  const values = Array.from({ length: 110 }).map((_, index) => `Transação #${String(index + 1).padStart(3, "0")}`);
  const placeholders = values.map((_, index) => `($${index + 1})`).join(",");
  await prisma.$executeRawUnsafe(`INSERT INTO public.${tableName} (descricao) VALUES ${placeholders}`, ...values);

  await page.goto(`/crud/public/${tableName}`);
  await expect(page.getByRole("heading", { name: label })).toBeVisible();

  await expect(page.getByText("Página 1 de 11")).toBeVisible();
  await expect(page.locator("text=/Transação #\\d{3}/").first()).toBeVisible();

  await page.getByRole("button", { name: "Próxima" }).click();
  await expect(page).toHaveURL(new RegExp(`/crud/public/${tableName}\\?page=2`));
  await expect(page.getByText("Página 2 de 11")).toBeVisible();
  await expect(page.locator("text=/Transação #\\d{3}/").first()).toBeVisible();

  await page.getByRole("button", { name: "Próxima" }).click();
  await expect(page).toHaveURL(new RegExp(`/crud/public/${tableName}\\?page=3`));
  await expect(page.getByText("Página 3 de 11")).toBeVisible();
});
