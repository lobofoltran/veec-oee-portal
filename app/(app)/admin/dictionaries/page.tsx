import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { requireAdminSession } from "../_lib/auth";
import { listDictionariesAction } from "./actions/list-dictionaries";
import { DictionariesTable } from "./components/dictionaries-table";
import { parseDictionariesQuery } from "./schema/dictionary.schema";

type Props = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DictionariesPage({ searchParams }: Props) {
  await requireAdminSession();

  const query = parseDictionariesQuery((await searchParams) ?? {});
  const data = await listDictionariesAction(query);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dicionários</h1>
          <p className="text-muted-foreground text-sm">Gerencie metadados de dicionários e estrutura dinâmica de tabelas.</p>
        </div>

        <Button asChild>
          <Link href="/admin/dictionaries/new" className="inline-flex items-center gap-2"><Plus className="size-4" /> Novo dicionário</Link>
        </Button>
      </div>

      {data.total === 0 ? (
        <Card>
          <CardHeader><CardTitle>Nenhum dicionário cadastrado</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">Crie seu primeiro dicionário para iniciar o gerenciamento dinâmico.</p>
            <Button asChild>
              <Link href="/admin/dictionaries/new" className="inline-flex items-center gap-2"><Plus className="size-4" /> Criar primeiro dicionário</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DictionariesTable
          rows={data.data.map((item) => ({ id: item.id, name: item.name, label: item.label, description: item.description, schema: item.schema, createdAt: item.createdAt, columnsCount: item.columnsCount, active: item.active }))}
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          totalPages={data.totalPages}
          q={query.q}
          sortBy={query.sortBy}
          sortDir={query.sortDir}
        />
      )}
    </div>
  );
}
