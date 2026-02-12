"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

import { menuFormSchema, type MenuFormInput } from "../schema/menu.schema";

type MenuMutationResult = {
  ok: boolean;
  id?: string;
  formError?: string;
  fieldErrors?: Record<string, string[]>;
};

export async function createMenuAction(input: MenuFormInput): Promise<MenuMutationResult> {
  const parsed = menuFormSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const created = await prisma.menu.create({
      data: {
        label: parsed.data.name,
        href: parsed.data.isFolder ? null : parsed.data.path,
        icon: parsed.data.icon?.trim() || "file",
        parentId: parsed.data.folderId,
        order: parsed.data.order,
        enabled: parsed.data.active && parsed.data.visible,
      },
    });

    revalidatePath("/admin/menus");
    revalidatePath("/");

    return { ok: true, id: created.id };
  } catch (error) {
    console.error("createMenuAction", error);
    return { ok: false, formError: "Não foi possível criar o menu." };
  }
}
