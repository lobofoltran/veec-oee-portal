"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function deleteMenuAction(id: string): Promise<{ ok: boolean; formError?: string }> {
  const childrenCount = await prisma.menu.count({ where: { parentId: id } });

  if (childrenCount > 0) {
    return { ok: false, formError: "Remova os itens filhos antes de excluir esta pasta/menu." };
  }

  try {
    await prisma.menuRole.deleteMany({ where: { menuId: id } });
    await prisma.menu.delete({ where: { id } });

    revalidatePath("/admin/menus");
    revalidatePath("/");

    return { ok: true };
  } catch (error) {
    console.error("deleteMenuAction", error);
    return { ok: false, formError: "Não foi possível excluir o menu." };
  }
}
