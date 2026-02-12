import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

import { listFoldersAction } from "../../actions/list-menus";
import { MenuBackButton } from "../../components/menu-back-button";
import { MenuForm } from "../../components/menu-form";
import { requireAdminSession } from "../../../_lib/auth";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditMenuPage({ params }: Props) {
  await requireAdminSession();
  const { id } = await params;

  const menu = await prisma.menu.findUnique({ where: { id } });
  if (!menu) notFound();

  const folders = await listFoldersAction();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3">
        <MenuBackButton />
        <div>
          <h1 className="text-2xl font-semibold">Editar menu</h1>
          <p className="text-muted-foreground text-sm">Atualize dados, hierarquia de pastas e visibilidade na sidebar.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do menu</CardTitle>
        </CardHeader>
        <CardContent>
          <MenuForm
            mode="edit"
            initialMenu={{ id: menu.id, label: menu.label, href: menu.href, icon: menu.icon, parentId: menu.parentId, order: menu.order, enabled: menu.enabled }}
            folders={folders.filter((folder) => folder.id !== id).map((folder) => ({ id: folder.id, label: folder.label, parentId: folder.parentId }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
