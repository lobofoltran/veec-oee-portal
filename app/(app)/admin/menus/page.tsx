import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { listMenusAction } from "./actions/list-menus";
import { MenuTable } from "./components/menu-table";
import { parseListMenusQuery } from "./schema/menu.schema";
import { requireAdminSession } from "../_lib/auth";

type MenusPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MenusPage({ searchParams }: MenusPageProps) {
  await requireAdminSession();

  const resolvedSearchParams = (await searchParams) ?? {};
  const query = parseListMenusQuery(resolvedSearchParams);
  const menus = await listMenusAction(query);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Menus</h1>
          <p className="text-muted-foreground text-sm">Gerencie menus e pastas da navegação lateral.</p>
        </div>
        <Button asChild>
          <Link href="/admin/menus/new" className="inline-flex items-center gap-2">
            <Plus className="size-4" /> Novo menu
          </Link>
        </Button>
      </div>

      {menus.total === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Nenhum menu cadastrado</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">Crie seu primeiro menu ou pasta para organizar a sidebar.</p>
            <Button asChild>
              <Link href="/admin/menus/new" className="inline-flex items-center gap-2">
                <Plus className="size-4" /> Criar primeiro menu
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <MenuTable menus={menus.data} page={menus.page} pageSize={menus.pageSize} total={menus.total} totalPages={menus.totalPages} q={query.q} sortBy={query.sortBy} sortDir={query.sortDir} />
      )}
    </div>
  );
}
