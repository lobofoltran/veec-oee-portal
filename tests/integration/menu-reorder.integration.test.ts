import { describe, expect, it } from "vitest";

import { reorderMenusAction } from "@/app/(app)/admin/menus/actions/reorder-menus";
import { prisma } from "@/lib/prisma";
import { isDatabaseAvailable } from "./helpers/db-availability";

const dbAvailable = await isDatabaseAvailable();
const describeIfDb = dbAvailable ? describe : describe.skip;

describeIfDb("menu reorder action integration", () => {
  it("reorders menu items using drag ordering payload", async () => {
    const suffix = Date.now();

    const menuA = await prisma.menu.create({
      data: {
        label: `IT Menu A ${suffix}`,
        href: `/it/menu-a-${suffix}`,
        icon: "FileText",
        order: 1,
        enabled: true,
      },
    });
    const menuB = await prisma.menu.create({
      data: {
        label: `IT Menu B ${suffix}`,
        href: `/it/menu-b-${suffix}`,
        icon: "FileText",
        order: 2,
        enabled: true,
      },
    });
    const menuC = await prisma.menu.create({
      data: {
        label: `IT Menu C ${suffix}`,
        href: `/it/menu-c-${suffix}`,
        icon: "FileText",
        order: 3,
        enabled: true,
      },
    });

    try {
      const result = await reorderMenusAction({
        orderedIds: [menuC.id, menuA.id, menuB.id],
        startOrder: 10,
      });

      expect(result.ok).toBe(true);

      const reloaded = await prisma.menu.findMany({
        where: {
          id: { in: [menuA.id, menuB.id, menuC.id] },
        },
        orderBy: { order: "asc" },
      });

      expect(reloaded.map((item) => item.id)).toEqual([menuC.id, menuA.id, menuB.id]);
      expect(reloaded.map((item) => item.order)).toEqual([10, 11, 12]);
    } finally {
      await prisma.menu.deleteMany({
        where: {
          id: { in: [menuA.id, menuB.id, menuC.id] },
        },
      });
    }
  });

  it("returns validation error for invalid payload", async () => {
    const result = await reorderMenusAction({
      orderedIds: [],
      startOrder: 0,
    });

    expect(result.ok).toBe(false);
    expect(result.formError).toBe("Dados de ordenação inválidos.");
  });
});
