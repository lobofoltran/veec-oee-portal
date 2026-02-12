import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteRow, getReferenceOptionsByColumn, getRow, updateRow } from "@/lib/dictionary/crud";
import { getTableMeta } from "@/lib/dictionary/loader";

import { CrudBackButton } from "../../../_components/crud-back-button";
import { CrudForm } from "../../../_components/crud-form";
import { requireAdminSession } from "../../../../admin/_lib/auth";

type Props = {
  params: Promise<{ schema: string; table: string; id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CrudEditPage({ params, searchParams }: Props) {
  await requireAdminSession();
  const { schema, table, id } = await params;
  const qp = (await searchParams) ?? {};
  const returnTo = typeof qp.returnTo === "string" ? qp.returnTo : `/crud/${schema}/${table}`;

  const meta = await getTableMeta(schema, table);
  const row = await getRow(schema, table, id);

  if (!meta || !row) return notFound();
  const tableMeta = meta;
  const selectOptions = await getReferenceOptionsByColumn(tableMeta);

  async function submit(formData: FormData) {
    "use server";

    const input: Record<string, unknown> = {};
    for (const column of tableMeta.columns) {
      if (column.name === "id") continue;
      if (column.type === "BOOLEAN") {
        input[column.name] = formData.get(column.name) === "on";
      } else {
        const value = formData.get(column.name);
        input[column.name] = typeof value === "string" && value.length > 0 ? value : null;
      }
    }

    await updateRow(schema, table, id, input);
    redirect(returnTo);
  }

  async function remove() {
    "use server";

    await deleteRow(schema, table, id);
    redirect(returnTo);
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
      <CrudBackButton href={returnTo} />

      <Card>
        <CardHeader>
          <CardTitle>Editar {tableMeta.label}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form action={submit}>
            <CrudForm table={tableMeta} row={row} selectOptions={selectOptions} submitLabel="Salvar alterações" />
          </form>
          <form action={remove}>
            <Button type="submit" variant="destructive">Excluir</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
