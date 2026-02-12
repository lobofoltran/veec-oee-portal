import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { requireAdminSession } from "../../_lib/auth";
import { DictionaryForm } from "../components/dictionary-form";

export default async function NewDictionaryPage() {
  await requireAdminSession();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3">
        <Button variant="outline" size="sm" asChild className="w-fit"><Link href="/admin/dictionaries">Voltar</Link></Button>
        <div>
          <h1 className="text-2xl font-semibold">Novo dicionário</h1>
          <p className="text-muted-foreground text-sm">Crie os metadados do dicionário antes de gerenciar colunas.</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Informações do dicionário</CardTitle></CardHeader>
        <CardContent><DictionaryForm mode="create" /></CardContent>
      </Card>
    </div>
  );
}
