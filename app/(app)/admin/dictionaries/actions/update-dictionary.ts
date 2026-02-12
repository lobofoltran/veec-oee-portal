"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import { dictionarySchema, type DictionaryFormInput } from "../schema/dictionary.schema";

export async function updateDictionaryAction(id: string, input: DictionaryFormInput) {
  const parsed = dictionarySchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.dictionaryTable.update({
      where: { id },
      data: {
        name: parsed.data.name,
        label: parsed.data.label,
        description: parsed.data.description || null,
        schema: "public",
        isSystem: !parsed.data.active,
      },
    });

    revalidatePath("/admin/dictionaries");
    revalidatePath(`/admin/dictionaries/${id}`);

    return { ok: true };
  } catch (error) {
    console.error("updateDictionaryAction", error);
    return { ok: false, formError: "Não foi possível atualizar o dicionário." };
  }
}
