import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { listFoldersAction } from "../actions/list-menus";
import { MenuBackButton } from "../components/menu-back-button";
import { MenuForm } from "../components/menu-form";
import { requireAdminSession } from "../../_lib/auth";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewMenuPage({ searchParams }: Props) {
  await requireAdminSession();
  const folders = await listFoldersAction();
  const qp = (await searchParams) ?? {};

  const prefill = {
    name: first(qp.name) ?? "",
    path: first(qp.path) ?? "",
    icon: first(qp.icon) ?? "FileText",
    folderId: first(qp.folderId) ?? null,
    order: Number(first(qp.order) ?? 0),
    active: (first(qp.active) ?? "true") === "true",
    visible: (first(qp.visible) ?? "true") === "true",
    isFolder: (first(qp.isFolder) ?? "false") === "true",
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3">
        <MenuBackButton />
        <div>
          <h1 className="text-2xl font-semibold">Novo menu</h1>
          <p className="text-muted-foreground text-sm">Crie um item de menu ou uma nova pasta.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações do menu</CardTitle>
        </CardHeader>
        <CardContent>
          <MenuForm mode="create" prefill={prefill} folders={folders.map((folder) => ({ id: folder.id, label: folder.label, parentId: folder.parentId }))} />
        </CardContent>
      </Card>
    </div>
  );
}
