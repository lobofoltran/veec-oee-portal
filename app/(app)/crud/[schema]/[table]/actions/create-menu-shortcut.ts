"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const createMenuShortcutSchema = z.object({
  label: z.string().trim().min(1, "Nome do menu é obrigatório."),
  href: z.string().trim().min(1, "Caminho é obrigatório.").startsWith("/", "Caminho deve iniciar com /."),
  icon: z.string().trim().optional(),
  order: z.coerce.number().int().default(0),
});

export type CreateMenuShortcutState = {
  ok: boolean;
  message?: string;
};

export async function createMenuShortcutAction(
  _previous: CreateMenuShortcutState,
  formData: FormData,
): Promise<CreateMenuShortcutState> {
  const parsed = createMenuShortcutSchema.safeParse({
    label: formData.get("label"),
    href: formData.get("href"),
    icon: formData.get("icon"),
    order: formData.get("order"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  try {
    const exists = await prisma.menu.findFirst({ where: { href: parsed.data.href } });
    if (exists) {
      return { ok: false, message: "Já existe um menu para esta página." };
    }

    await prisma.menu.create({
      data: {
        label: parsed.data.label,
        href: parsed.data.href,
        icon: parsed.data.icon || "FileText",
        order: parsed.data.order,
        enabled: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/menus");

    return { ok: true, message: "Menu criado com sucesso." };
  } catch (error) {
    console.error("createMenuShortcutAction", error);
    return { ok: false, message: "Não foi possível criar o menu." };
  }
}
