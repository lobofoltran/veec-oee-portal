"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function deleteDictionaryAction(id: string) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.dictionaryColumn.deleteMany({ where: { tableId: id } });
      await tx.dictionaryTable.delete({ where: { id } });
    });

    revalidatePath("/admin/dictionaries");

    return { ok: true };
  } catch (error) {
    console.error("deleteDictionaryAction", error);
    return { ok: false, formError: "Não foi possível excluir o dicionário." };
  }
}
