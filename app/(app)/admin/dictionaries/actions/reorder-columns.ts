"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const reorderSchema = z.object({
  dictionaryId: z.string().uuid(),
  orderedIds: z.array(z.string().uuid()).min(1),
});

export async function reorderColumnsAction(input: unknown) {
  const parsed = reorderSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, formError: "Dados de ordenação inválidos." };
  }

  try {
    await prisma.$transaction(
      parsed.data.orderedIds.map((id, index) =>
        prisma.dictionaryColumn.update({
          where: { id },
          data: { order: index + 1 },
        }),
      ),
    );

    try {
      revalidatePath(`/admin/dictionaries/${parsed.data.dictionaryId}/columns`);
    } catch (revalidateError) {
      console.warn("reorderColumnsAction revalidate", revalidateError);
    }
    return { ok: true };
  } catch (error) {
    console.error("reorderColumnsAction", error);
    return { ok: false, formError: "Não foi possível reordenar as colunas." };
  }
}
