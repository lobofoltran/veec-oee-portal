import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { requireAdminSession } from "../../_lib/auth";
import { getDictionaryByIdAction } from "../actions/list-dictionaries";

type Props = { params: Promise<{ id: string }> };

export default async function DictionaryDetailsPage({ params }: Props) {
  await requireAdminSession();
  const { id } = await params;

  const dictionary = await getDictionaryByIdAction(id);
  if (!dictionary) notFound();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3">
        <Button variant="outline" size="sm" asChild className="w-fit"><Link href="/admin/dictionaries">Voltar</Link></Button>
        <div>
          <h1 className="text-2xl font-semibold">{dictionary.label}</h1>
          <p className="text-muted-foreground text-sm">{dictionary.description || "Sem descrição"}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Colunas</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-semibold">{dictionary.columns.length}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Schema</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-semibold">public</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Última execução</CardTitle></CardHeader>
          <CardContent><p className="text-sm">{new Date(dictionary.updatedAt).toLocaleString()}</p></CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline"><Link href={`/admin/dictionaries/${id}/edit`}>Editar dicionário</Link></Button>
        <Button asChild variant="outline"><Link href={`/admin/dictionaries/${id}/columns`}>Gerenciar colunas</Link></Button>
        <Button asChild variant="outline"><Link href={`/crud/public/${dictionary.name}`}>Ir para página</Link></Button>
        <Button asChild><Link href={`/admin/dictionaries/${id}/columns`}>Executar</Link></Button>
      </div>
    </div>
  );
}
