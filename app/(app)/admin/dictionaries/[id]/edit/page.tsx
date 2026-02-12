import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { requireAdminSession } from "../../../_lib/auth";
import { getDictionaryByIdAction } from "../../actions/list-dictionaries";
import { DictionaryForm } from "../../components/dictionary-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditDictionaryPage({ params }: Props) {
  await requireAdminSession();
  const { id } = await params;

  const dictionary = await getDictionaryByIdAction(id);
  if (!dictionary) notFound();

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3">
        <Button variant="outline" size="sm" asChild className="w-fit"><Link href={`/admin/dictionaries/${id}`}>Voltar para detalhes</Link></Button>
        <div>
          <h1 className="text-2xl font-semibold">Editar dicionário</h1>
          <p className="text-muted-foreground text-sm">Atualize metadados e status de ativação.</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Informações do dicionário</CardTitle></CardHeader>
        <CardContent>
          <DictionaryForm mode="edit" initial={{ id: dictionary.id, name: dictionary.name, label: dictionary.label, description: dictionary.description, schema: "public", active: !dictionary.isSystem }} />
        </CardContent>
      </Card>
    </div>
  );
}
