"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function deleteColumnAction(id: string, dictionaryId: string) {
  try {
    await prisma.dictionaryColumn.delete({ where: { id } });
    try {
      revalidatePath(`/admin/dictionaries/${dictionaryId}/columns`);
    } catch (revalidateError) {
      console.warn("deleteColumnAction revalidate", revalidateError);
    }
    return { ok: true };
  } catch (error) {
    console.error("deleteColumnAction", error);
    return { ok: false, formError: "Não foi possível excluir o rascunho da coluna." };
  }
}
