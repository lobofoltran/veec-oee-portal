import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";

import { requireAdminSession } from "../../../_lib/auth";
import { getDictionaryByIdAction } from "../../actions/list-dictionaries";
import { ColumnsManager } from "../../components/columns-manager";

type Props = { params: Promise<{ id: string }> };

export default async function DictionaryColumnsPage({ params }: Props) {
  await requireAdminSession();
  const { id } = await params;

  const dictionary = await getDictionaryByIdAction(id);
  if (!dictionary) notFound();

  const dictionaries = await prisma.dictionaryTable.findMany({
    where: { isSystem: false },
    include: {
      columns: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { label: "asc" },
  });

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col gap-3">
        <Button variant="outline" size="sm" asChild className="w-fit"><Link href={`/admin/dictionaries/${id}`}>Voltar para dicionário</Link></Button>
        <div>
          <h1 className="text-2xl font-semibold">Gerenciar colunas</h1>
          <p className="text-muted-foreground text-sm">Crie e edite rascunhos de colunas antes de executar a estrutura física.</p>
        </div>
      </div>

      <ColumnsManager
        dictionaryId={id}
        initialColumns={dictionary.columns.map((column) => ({
          id: column.id,
          name: column.name,
          label: column.label,
          type: column.type,
          required: column.required,
          defaultValue: column.defaultValue,
          order: column.order,
          length: column.length,
          precision: column.precision,
          scale: column.scale,
          autoGenerate: column.autoGenerate,
          fkTableId: column.fkTableId,
          fkColumnName: column.fkColumnName,
          displayField: column.displayField,
          optionsJson: column.optionsJson,
        }))}
        dictionaries={dictionaries.map((item) => ({
          id: item.id,
          label: item.label,
          name: item.name,
          columns: item.columns.map((column) => ({ name: column.name, label: column.label })),
        }))}
      />
    </div>
  );
}
