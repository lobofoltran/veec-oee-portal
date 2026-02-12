"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import { dictionarySchema, type DictionaryFormInput } from "../schema/dictionary.schema";

export async function createDictionaryAction(input: DictionaryFormInput) {
  const parsed = dictionarySchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  try {
    const created = await prisma.dictionaryTable.create({
      data: {
        schema: "public",
        name: parsed.data.name,
        label: parsed.data.label,
        description: parsed.data.description || null,
        isSystem: !parsed.data.active,
      },
    });

    revalidatePath("/admin/dictionaries");

    return { ok: true, id: created.id };
  } catch (error) {
    console.error("createDictionaryAction", error);
    return { ok: false, formError: "Não foi possível criar o dicionário." };
  }
}
