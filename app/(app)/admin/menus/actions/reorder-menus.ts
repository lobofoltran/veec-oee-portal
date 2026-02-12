"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const reorderMenusSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1),
  startOrder: z.coerce.number().int().min(1).default(1),
});

export async function reorderMenusAction(input: unknown) {
  const parsed = reorderMenusSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, formError: "Dados de ordenação inválidos." };
  }

  try {
    await prisma.$transaction(
      parsed.data.orderedIds.map((id, index) =>
        prisma.menu.update({
          where: { id },
          data: { order: parsed.data.startOrder + index },
        }),
      ),
    );

    try {
      revalidatePath("/admin/menus");
      revalidatePath("/");
    } catch (error) {
      // Ignora ausência do static generation store em ambiente de teste.
      if (process.env.NODE_ENV !== "test") {
        throw error;
      }
    }

    return { ok: true };
  } catch (error) {
    console.error("reorderMenusAction", error);
    return { ok: false, formError: "Não foi possível reordenar os menus." };
  }
}
